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
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // Return as-is if it's already in YYYY-MM-DD format
    return dateStr;
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
};

export const createCustomerProfile = async (fullName: string) => {
  if (!fullName) {
    fullName = `Unknown Customer ${Date.now()}`;
  }

  const id = crypto.randomUUID();

  try {
    const { data: customer, error } = await supabase
      .from('profiles')
      .insert({
        id,
        full_name: fullName,
        role: 'customer'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer profile:', error);
      return { id };
    }

    return customer;
  } catch (error) {
    console.error('Error in createCustomerProfile:', error);
    return { id };
  }
};

export const getOrCreateCustomer = async (fullName: string) => {
  if (!fullName) {
    return createCustomerProfile('');
  }

  try {
    const { data: existingCustomer, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', fullName)
      .maybeSingle();

    if (existingCustomer) {
      return existingCustomer;
    }

    if (error) {
      console.error('Error finding customer:', error);
    }

    return createCustomerProfile(fullName);
  } catch (error) {
    console.error('Error in getOrCreateCustomer:', error);
    return createCustomerProfile(fullName);
  }
};

export const getAvailableVehicle = async () => {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('id')
      .eq('status', 'available')
      .limit(1)
      .maybeSingle();

    if (error || !vehicle) {
      console.error('Error getting vehicle:', error);
      return { id: crypto.randomUUID() };
    }

    return vehicle;
  } catch (error) {
    console.error('Error in getAvailableVehicle:', error);
    return { id: crypto.randomUUID() };
  }
};

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  try {
    const checkoutDate = formatDate(agreement['Check-out Date']);
    const checkinDate = formatDate(agreement['Check-in Date']);
    const returnDate = formatDate(agreement['Return Date']);

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
    }
  } catch (error) {
    console.error('Error in createAgreement:', error);
  }
};