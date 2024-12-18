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
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      const parsedMonth = parseInt(month);
      const parsedDay = parseInt(day);
      
      // Basic validation
      if (parsedMonth > 12 || parsedDay > 31) {
        console.error('Invalid date components:', { day, month, year });
        return null;
      }
      
      return `${year}-${parsedMonth.toString().padStart(2, '0')}-${parsedDay.toString().padStart(2, '0')}`;
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      const parsedMonth = parseInt(month);
      const parsedDay = parseInt(day);
      
      // Basic validation
      if (parsedMonth > 12 || parsedDay > 31) {
        console.error('Invalid date components:', { year, month, day });
        return null;
      }
      
      return dateStr;
    }
    
    console.error('Unsupported date format:', dateStr);
    return null;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

export const getOrCreateCustomer = async (fullName: string) => {
  try {
    // First, try to find an existing customer by name
    const { data: existingCustomer } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', fullName)
      .maybeSingle();

    if (existingCustomer) {
      return existingCustomer;
    }

    // If no customer exists, create a new one
    const { data: newCustomer, error } = await supabase
      .from('profiles')
      .insert({
        full_name: fullName || `Unknown Customer ${Date.now()}`,
        role: 'customer'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer profile:', error);
      throw error;
    }

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
      .eq('status', 'available')
      .limit(1)
      .maybeSingle();

    if (existingVehicle) {
      return existingVehicle;
    }

    // If no vehicle exists, create a default one
    const { data: newVehicle, error } = await supabase
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

    if (error) {
      console.error('Error creating default vehicle:', error);
      throw error;
    }

    return newVehicle;
  } catch (error) {
    console.error('Error in getAvailableVehicle:', error);
    throw error;
  }
};

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  try {
    const checkoutDate = formatDate(agreement['Check-out Date']);
    const checkinDate = formatDate(agreement['Check-in Date']);
    const returnDate = formatDate(agreement['Return Date']);

    if (!checkoutDate && !checkinDate && !returnDate) {
      console.error('All dates are invalid:', agreement);
      throw new Error('Invalid dates in agreement');
    }

    const { error } = await supabase
      .from('leases')
      .insert({
        agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
        license_no: agreement['License No'],
        license_number: agreement['License Number'],
        checkout_date: checkoutDate,
        checkin_date: checkinDate,
        return_date: returnDate,
        status: normalizeStatus(agreement['STATUS']),
        customer_id: customerId,
        vehicle_id: vehicleId,
        total_amount: 0,
        initial_mileage: 0
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