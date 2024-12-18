import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from 'uuid';

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

// Simplified function that creates a default customer profile
export const getOrCreateCustomer = async () => {
  try {
    // First try to get an existing default customer
    const { data: existingCustomer } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', 'Default Customer')
      .single();
      
    if (existingCustomer) {
      console.log('Using existing default customer:', existingCustomer);
      return existingCustomer;
    }
    
    // Create a new default customer with a generated UUID
    const newCustomerId = uuidv4();
    const { data: newCustomer, error } = await supabase
      .from('profiles')
      .insert({
        id: newCustomerId,
        full_name: 'Default Customer',
        role: 'customer'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating default customer:', error);
      throw error;
    }
    
    console.log('Created new default customer:', newCustomer);
    return newCustomer;
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error);
    throw error;
  }
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