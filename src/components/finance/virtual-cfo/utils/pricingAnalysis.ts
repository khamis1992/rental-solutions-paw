import { supabase } from "@/integrations/supabase/client";
import { analyzeMarketPricing } from "./deepseekAnalysis";

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
    rentsByModel[key].push(lease.rent_amount || 0);
    countByModel[key]++;
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

  const suggestions = await Promise.all(vehicles.map(async vehicle => {
    const currentLease = vehicle.leases?.find(l => l.status === 'active');
    const currentPrice = currentLease?.rent_amount || 0;

    try {
      const aiAnalysis = await analyzeMarketPricing({
        vehicle,
        currentPrice,
        marketData: {
          averageRents: await calculateAverageRentByModel(),
          margins: await calculateProfitMargins()
        }
      });

      let suggestedPrice = currentPrice;
      let reason = '';

      if (aiAnalysis) {
        try {
          const analysis = JSON.parse(aiAnalysis);
          suggestedPrice = analysis.suggestedPrice || currentPrice;
          reason = analysis.reason || 'Price is within market range';
        } catch (e) {
          console.error('Error parsing AI analysis:', e);
        }
      }

      const margin = await calculateProfitMargins();
      const vehicleMargin = margin.find(m => m.vehicleId === vehicle.id)?.profitMargin || 0;

      return {
        vehicleId: vehicle.id,
        licensePlate: vehicle.license_plate,
        currentPrice,
        suggestedPrice: Math.round(suggestedPrice),
        profitMargin: vehicleMargin,
        reason: reason || 'Price is within market range'
      };
    } catch (error) {
      console.error('Error analyzing market pricing:', error);
      return {
        vehicleId: vehicle.id,
        licensePlate: vehicle.license_plate,
        currentPrice,
        suggestedPrice: currentPrice,
        profitMargin: 0,
        reason: 'Unable to analyze pricing at this time'
      };
    }
  }));

  return suggestions;
};