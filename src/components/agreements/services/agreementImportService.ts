import { supabase } from "@/integrations/supabase/client";
import { retryOperation } from "../utils/retryUtils";
import { getOrCreateCustomer, getAvailableVehicle } from "./entityService";
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
    // Split the date string and remove any whitespace
    const parts = dateStr.split('/').map(part => part.trim());
    
    if (parts.length !== 3) {
      console.error('Invalid date format. Expected DD/MM/YYYY but got:', dateStr);
      return null;
    }

    const [day, month, year] = parts;
    
    // Validate each part is a number
    if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
      console.error('Invalid date parts:', { day, month, year });
      return null;
    }

    // Format as YYYY-MM-DD for Postgres
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

export const createAgreement = async (agreement: Record<string, string>, customerId: string, vehicleId: string) => {
  try {
    console.log('Raw CSV data for dates:', {
      checkoutDate: agreement['Check-out Date'],
      checkinDate: agreement['Check-in Date'],
      returnDate: agreement['Return Date']
    });

    const agreementData = {
      agreement_number: agreement['Agreement Number'] || `AGR${Date.now()}`,
      license_no: agreement['License No'] || 'UNKNOWN',
      license_number: agreement['License Number'] || 'UNKNOWN',
      start_date: formatDateForPostgres(agreement['Check-out Date']),
      end_date: formatDateForPostgres(agreement['Check-in Date']),
      return_date: formatDateForPostgres(agreement['Return Date']),
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