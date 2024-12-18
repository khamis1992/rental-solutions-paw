import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type LeaseStatus = Database["public"]["Enums"]["lease_status"];

const normalizeStatus = (status: string): LeaseStatus => {
  if (!status) return 'pending_payment';
  const statusMap: Record<string, LeaseStatus> = {
    'open': 'active',
    'active': 'active',
    'closed': 'closed',
    'cancelled': 'closed',
    'pending': 'pending_payment',
    'pending_payment': 'pending_payment',
    'pending_deposit': 'pending_deposit'
  };
  return statusMap[status.toLowerCase().trim()] || 'pending_payment';
};

const formatDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  return dateStr; // Return date string as-is without validation
};

// Simplified function that just returns a UUID for customer_id
export const getOrCreateCustomer = async () => {
  const { data: defaultCustomer } = await supabase
    .from('profiles')
    .select('id')
    .limit(1)
    .single();
    
  if (defaultCustomer) {
    return defaultCustomer;
  }
  
  // Create a default customer if none exists
  const { data: newCustomer } = await supabase
    .from('profiles')
    .insert({
      full_name: `Default Customer`,
      role: 'customer'
    })
    .select()
    .single();
    
  return newCustomer;
};

export const getAvailableVehicle = async () => {
  try {
    // First try to get an existing available vehicle
    const { data: existingVehicle } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1)
      .single();

    if (existingVehicle) {
      return existingVehicle;
    }

    // If no vehicle exists, create a default one
    const { data: newVehicle } = await supabase
      .from('vehicles')
      .insert({
        make: 'Default',
        model: 'Model',
        year: 2024,
        license_plate: 'TEMP-' + Date.now(),
        vin: 'TEMP-' + Date.now(),
        status: 'available'
      })
      .select()
      .single();

    return newVehicle;
  } catch (error) {
    console.error('Error in getAvailableVehicle:', error);
    throw error;
  }
};

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  try {
    const { error } = await supabase
      .from('leases')
      .insert({
        agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
        license_no: agreement['License No'] || 'UNKNOWN',
        license_number: agreement['License Number'] || 'UNKNOWN',
        checkout_date: formatDate(agreement['Check-out Date']),
        checkin_date: formatDate(agreement['Check-in Date']),
        return_date: formatDate(agreement['Return Date']),
        status: normalizeStatus(agreement['STATUS']),
        customer_id: customerId,
        vehicle_id: vehicleId,
        total_amount: 0,
        initial_mileage: 0
      });

    if (error) {
      console.error('Error creating agreement:', error);
    }
  } catch (error) {
    console.error('Error in createAgreement:', error);
  }
};