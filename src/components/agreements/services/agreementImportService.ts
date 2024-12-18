import { supabase } from "@/integrations/supabase/client";
import { convertDateFormat } from "../utils/dateUtils";
import { retryOperation } from "../utils/retryUtils";
import { getOrCreateCustomer, getAvailableVehicle } from "./entityService";

const normalizeStatus = (status: string): string => {
  if (!status) return 'pending_payment';
  const statusMap: Record<string, string> = {
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

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  try {
    console.log('Raw CSV data for dates:', {
      checkoutDate: agreement['Check-out Date'],
      checkinDate: agreement['Check-in Date'],
      returnDate: agreement['Return Date']
    });

    const startDate = convertDateFormat(agreement['Check-out Date']);
    const endDate = convertDateFormat(agreement['Check-in Date']);
    const returnDate = convertDateFormat(agreement['Return Date']);

    console.log('Converted dates:', {
      startDate,
      endDate,
      returnDate
    });

    const agreementData = {
      agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
      license_no: agreement['License No'] || 'UNKNOWN',
      license_number: agreement['License Number'] || 'UNKNOWN',
      start_date: startDate,
      end_date: endDate,
      return_date: returnDate,
      status: normalizeStatus(agreement['STATUS']),
      customer_id: customerId,
      vehicle_id: vehicleId,
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

export { getOrCreateCustomer, getAvailableVehicle };