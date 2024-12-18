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
  
  try {
    // First, clean the input string
    dateStr = dateStr.trim();
    
    // Handle different date formats
    let day: number, month: number, year: number;
    
    // Try DD/MM/YYYY format
    if (dateStr.includes('/')) {
      [day, month, year] = dateStr.split('/').map(num => parseInt(num.trim(), 10));
    } 
    // Try DD-MM-YYYY format
    else if (dateStr.includes('-')) {
      [day, month, year] = dateStr.split('-').map(num => parseInt(num.trim(), 10));
    } else {
      return null;
    }
    
    // Validate date parts
    if (!day || !month || !year) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    // Additional date validation
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return null;
    
    // Format as YYYY-MM-DD for Supabase
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

export const getOrCreateCustomer = async () => {
  try {
    // First try to get an existing customer
    const { data: existingCustomer } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'customer')
      .limit(1)
      .single();
      
    if (existingCustomer) {
      console.log('Using existing customer:', existingCustomer.id);
      return existingCustomer;
    }
    
    // Create a new customer with a generated UUID
    const newCustomerId = crypto.randomUUID();
    const { data: newCustomer, error } = await supabase
      .from('profiles')
      .insert({
        id: newCustomerId,
        full_name: `Default Customer`,
        role: 'customer'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    console.log('Created new customer:', newCustomer.id);
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
    const agreementData = {
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
    };

    console.log('Creating agreement with data:', agreementData);

    const { error } = await supabase
      .from('leases')
      .upsert(agreementData, {
        onConflict: 'agreement_number',
        ignoreDuplicates: true // Changed to true to skip duplicates instead of updating them
      });

    if (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in createAgreement:', error);
    throw error;
  }
};