import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { parseDate } from "../utils/dateUtils";

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

export const createCustomerProfile = async (fullName: string) => {
  const newCustomerId = crypto.randomUUID();
  const { data: customer, error } = await supabase
    .from('profiles')
    .insert({
      id: newCustomerId,
      full_name: fullName || `Unknown Customer ${Date.now()}`,
      role: 'customer'
    })
    .select()
    .single();

  if (error) throw error;
  return customer;
};

export const getOrCreateCustomer = async (fullName: string) => {
  const { data: existingCustomer } = await supabase
    .from('profiles')
    .select('id')
    .eq('full_name', fullName)
    .single();

  if (existingCustomer) {
    return existingCustomer;
  }

  return createCustomerProfile(fullName);
};

export const getAvailableVehicle = async () => {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('id')
    .eq('status', 'available')
    .limit(1)
    .single();

  if (error) throw error;
  return vehicle;
};

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  const { error } = await supabase
    .from('leases')
    .insert({
      agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
      license_no: agreement['License No'],
      license_number: agreement['License Number'],
      checkout_date: parseDate(agreement['Check-out Date']),
      checkin_date: parseDate(agreement['Check-in Date']),
      return_date: parseDate(agreement['Return Date']),
      status: normalizeStatus(agreement['STATUS']),
      customer_id: customerId,
      vehicle_id: vehicleId,
      total_amount: 0,
      initial_mileage: 0
    });

  if (error) throw error;
};