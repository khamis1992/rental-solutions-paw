import { supabase } from "@/integrations/supabase/client";
import { retryOperation } from "../utils/retryUtils";
import { Database } from "@/integrations/supabase/types";

type LeaseStatus = Database['public']['Enums']['lease_status'];

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

const formatDateForPostgres = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    const parts = dateStr.split('/').map(part => part.trim());
    
    if (parts.length !== 3) {
      console.error('Invalid date format. Expected DD/MM/YYYY but got:', dateStr);
      return null;
    }

    const [day, month, year] = parts;
    
    if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
      console.error('Invalid date parts:', { day, month, year });
      return null;
    }

    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    console.log('Date formatting:', {
      original: dateStr,
      parts: { day, month, year },
      formatted: formattedDate
    });
    
    return formattedDate;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

export const getOrCreateCustomer = async (fullName: string) => {
  try {
    // First try to find existing customer
    const { data: existingCustomer, error: searchError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('full_name', fullName)
      .maybeSingle();

    if (existingCustomer) {
      console.log('Found existing customer:', existingCustomer);
      return existingCustomer;
    }

    // Generate a new UUID for the customer
    const newCustomerId = crypto.randomUUID();

    // If no existing customer, create new one
    const { data: newCustomer, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: newCustomerId,
        full_name: fullName,
        role: 'customer'
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('Created new customer:', newCustomer);
    return newCustomer;
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error);
    throw error;
  }
};

export const getOrCreateVehicle = async (licensePlate: string) => {
  try {
    // First try to find existing vehicle
    const { data: existingVehicle, error: searchError } = await supabase
      .from('vehicles')
      .select('id, license_plate')
      .eq('license_plate', licensePlate)
      .maybeSingle();

    if (existingVehicle) {
      console.log('Found existing vehicle:', existingVehicle);
      return existingVehicle;
    }

    // If no existing vehicle, create a new one
    const { data: newVehicle, error: createError } = await supabase
      .from('vehicles')
      .insert({
        license_plate: licensePlate,
        make: 'Default',
        model: 'Model',
        year: new Date().getFullYear(),
        vin: `TEMP-${Date.now()}`,
        status: 'available'
      })
      .select()
      .single();

    if (createError) throw createError;

    console.log('Created new vehicle:', newVehicle);
    return newVehicle;
  } catch (error) {
    console.error('Error in getOrCreateVehicle:', error);
    throw error;
  }
};

export const createAgreement = async (agreement: Record<string, string>) => {
  try {
    console.log('Raw CSV data:', agreement);

    // Get or create customer based on Customer Name from CSV
    const customer = await getOrCreateCustomer(agreement['Customer Name']);
    
    // Get or create vehicle based on License Plate from CSV
    const vehicle = await getOrCreateVehicle(agreement['License Plate']);

    const agreementData = {
      agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
      license_number: agreement['License Number'] || 'UNKNOWN',
      start_date: formatDateForPostgres(agreement['Start Date']),
      end_date: formatDateForPostgres(agreement['End Date']),
      return_date: formatDateForPostgres(agreement['Return Date']),
      status: normalizeStatus(agreement['STATUS']),
      customer_id: customer.id,
      vehicle_id: vehicle.id,
      total_amount: 0,
      initial_mileage: 0
    };

    console.log('Creating agreement with data:', agreementData);

    const { error } = await retryOperation(async () =>
      await supabase
        .from('leases')
        .upsert(agreementData, {
          onConflict: 'agreement_number',
          ignoreDuplicates: true
        })
    );

    if (error) {
      if (error.code === '23505') {
        console.log('Skipping duplicate agreement:', agreementData.agreement_number);
        return;
      }
      console.error('Error creating agreement:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in createAgreement:', error);
    throw error;
  }
};
