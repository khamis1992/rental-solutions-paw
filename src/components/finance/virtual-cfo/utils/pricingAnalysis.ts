import { supabase } from "@/integrations/supabase/client";

interface AverageRent {
  model: string;
  averageRent: number;
  count: number;
}

interface ProfitMargin {
  vehicleId: string;
  vehicle: string;
  revenue: number;
  costs: number;
  profitMargin: number;
}

interface PricingSuggestion {
  vehicleId: string;
  licensePlate: string;
  currentPrice: number;
  suggestedPrice: number;
  profitMargin: number;
  reason: string;
}

export const calculateAverageRentByModel = async (): Promise<AverageRent[]> => {
  const { data, error } = await supabase
    .from('leases')
    .select(`
      rent_amount,
      vehicle:vehicles (
        make,
        model,
        year
      )
    `)
    .eq('status', 'active');

  if (error) throw error;

  const rentsByModel: { [key: string]: number[] } = {};
  const countByModel: { [key: string]: number } = {};

  data.forEach((lease) => {
    if (!lease.vehicle) return;
    const key = `${lease.vehicle.make} ${lease.vehicle.model} ${lease.vehicle.year}`;
    if (!rentsByModel[key]) {
      rentsByModel[key] = [];
      countByModel[key] = 0;
    }
    if (lease.rent_amount) {
      rentsByModel[key].push(lease.rent_amount);
      countByModel[key]++;
    }
  });

  return Object.entries(rentsByModel).map(([model, rents]) => ({
    model,
    averageRent: rents.reduce((a, b) => a + b, 0) / rents.length,
    count: countByModel[model]
  }));
};

export const calculateProfitMargins = async (): Promise<ProfitMargin[]> => {
  const { data: leases, error: leaseError } = await supabase
    .from('leases')
    .select(`
      id,
      rent_amount,
      vehicle_id,
      vehicle:vehicles (
        make,
        model,
        year
      )
    `)
    .eq('status', 'active');

  if (leaseError) throw leaseError;

  const profitMargins = await Promise.all(
    leases.map(async (lease) => {
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance')
        .select('cost')
        .eq('vehicle_id', lease.vehicle_id);

      if (maintenanceError) throw maintenanceError;

      const maintenanceCosts = maintenanceData?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
      const monthlyRevenue = lease.rent_amount || 0;
      const profitMargin = monthlyRevenue > 0 
        ? ((monthlyRevenue - maintenanceCosts) / monthlyRevenue) * 100 
        : 0;

      return {
        vehicleId: lease.vehicle_id,
        vehicle: lease.vehicle ? `${lease.vehicle.make} ${lease.vehicle.model} ${lease.vehicle.year}` : 'Unknown',
        revenue: monthlyRevenue,
        costs: maintenanceCosts,
        profitMargin
      };
    })
  );

  return profitMargins;
};

export const generatePricingSuggestions = async (): Promise<PricingSuggestion[]> => {
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select(`
      id,
      make,
      model,
      year,
      license_plate,
      leases (
        rent_amount,
        status
      )
    `)
    .eq('status', 'available');

  if (error) throw error;

  const averageRents = await calculateAverageRentByModel();
  const margins = await calculateProfitMargins();

  const suggestions = vehicles.map(vehicle => {
    const currentLease = vehicle.leases?.find(l => l.status === 'active');
    const currentPrice = currentLease?.rent_amount || 0;
    const modelKey = `${vehicle.make} ${vehicle.model} ${vehicle.year}`;
    
    // Get average rent for this model from our system
    const modelAverage = averageRents.find(avg => avg.model === modelKey);
    const systemAverage = modelAverage?.averageRent || 0;
    
    // Get profit margin from our system data
    const vehicleMargin = margins.find(m => m.vehicleId === vehicle.id)?.profitMargin || 0;
    
    // Calculate suggested price based on our system data
    let suggestedPrice = systemAverage > 0 ? systemAverage : currentPrice;
    let reason = '';

    if (vehicleMargin < 15) {
      suggestedPrice = Math.max(currentPrice * 1.15, systemAverage);
      reason = 'Low profit margin (below 15%) - price increase recommended';
    } else if (vehicleMargin < 25 && currentPrice < systemAverage) {
      suggestedPrice = systemAverage;
      reason = 'Below average system price with moderate profit margin - adjustment recommended';
    } else if (vehicleMargin > 40) {
      suggestedPrice = Math.min(currentPrice * 0.95, systemAverage);
      reason = 'High profit margin (above 40%) - consider competitive pricing';
    } else if (systemAverage > 0 && Math.abs(systemAverage - currentPrice) / currentPrice > 0.25) {
      suggestedPrice = systemAverage;
      reason = 'Significant deviation from system average price - alignment recommended';
    } else {
      suggestedPrice = currentPrice > 0 ? currentPrice : systemAverage;
      reason = 'Price is optimal based on system data';
    }

    // Ensure we never return 0 as a suggested price
    if (suggestedPrice === 0 && systemAverage > 0) {
      suggestedPrice = systemAverage;
    } else if (suggestedPrice === 0 && currentPrice > 0) {
      suggestedPrice = currentPrice;
    }

    return {
      vehicleId: vehicle.id,
      licensePlate: vehicle.license_plate,
      currentPrice,
      suggestedPrice,
      profitMargin: vehicleMargin,
      reason
    };
  });

  return suggestions;
};