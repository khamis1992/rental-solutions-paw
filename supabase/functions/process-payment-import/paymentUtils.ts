import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export interface PaymentData {
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  paymentNumber: string;
}

export const findCustomerWithActiveLease = async (
  supabase: any,
  customerName: string
): Promise<{ customerId: string; leaseId: string } | null> => {
  // Look up customer in profiles
  const { data: customerData, error: customerError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('full_name', customerName.trim())
    .single();

  if (customerError || !customerData) {
    console.log(`Customer "${customerName}" not found`);
    return null;
  }

  // Find active lease for customer
  const { data: activeLease, error: leaseError } = await supabase
    .from('leases')
    .select('id')
    .eq('customer_id', customerData.id)
    .in('status', ['active', 'pending_payment'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (leaseError || !activeLease) {
    console.log(`No active lease found for customer "${customerName}"`);
    return null;
  }

  return {
    customerId: customerData.id,
    leaseId: activeLease.id
  };
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr) {
    throw new Error('Payment date is required');
  }

  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected format: DD-MM-YYYY`);
  }

  const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
  
  // Validate individual components
  if (year < 1900 || year > 2100) {
    throw new Error(`Invalid year: ${year}. Year must be between 1900 and 2100`);
  }
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Month must be between 1 and 12`);
  }
  if (day < 1 || day > 31) {
    throw new Error(`Invalid day: ${day}. Day must be between 1 and 31`);
  }

  // Create date using local timezone to avoid UTC conversion issues
  const date = new Date(year, month - 1, day);
  
  // Additional validation for valid date (e.g., Feb 31 is invalid)
  if (date.getMonth() !== month - 1) {
    throw new Error(`Invalid date: ${dateStr}. The date does not exist in the calendar.`);
  }
  
  return date;
};

export const createPaymentRecord = async (
  supabase: any,
  leaseId: string,
  paymentData: PaymentData
) => {
  try {
    console.log('Processing payment with date:', paymentData.paymentDate);
    const paymentDate = parseDate(paymentData.paymentDate);
    console.log('Successfully parsed payment date:', paymentDate);

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount: paymentData.amount,
        status: paymentData.status,
        payment_date: paymentDate.toISOString(),
        payment_method: paymentData.paymentMethod,
        transaction_id: paymentData.paymentNumber,
      });

    if (paymentError) {
      console.error('Error inserting payment record:', paymentError);
      throw paymentError;
    }
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
};

export const processPaymentRow = async (
  supabase: any,
  headers: string[],
  values: string[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate that we have all required values
    if (values.length < headers.length) {
      throw new Error(`Invalid row data: expected ${headers.length} values but got ${values.length}`);
    }

    const paymentData: PaymentData = {
      customerName: values[headers.indexOf('Customer Name')]?.trim() || '',
      amount: parseFloat(values[headers.indexOf('Amount')] || '0'),
      paymentDate: values[headers.indexOf('Payment_Date')]?.trim() || '',
      paymentMethod: values[headers.indexOf('Payment_Method')]?.trim() || '',
      status: values[headers.indexOf('status')]?.trim() || '',
      paymentNumber: values[headers.indexOf('Payment_Number')]?.trim() || '',
    };

    // Validate required fields
    if (!paymentData.customerName) {
      throw new Error('Customer Name is required');
    }
    if (!paymentData.amount || isNaN(paymentData.amount)) {
      throw new Error('Valid Amount is required');
    }
    if (!paymentData.paymentDate) {
      throw new Error('Payment Date is required');
    }

    const customerLease = await findCustomerWithActiveLease(supabase, paymentData.customerName);
    
    if (!customerLease) {
      return {
        success: false,
        error: `No active lease found for customer: ${paymentData.customerName}`
      };
    }

    await createPaymentRecord(supabase, customerLease.leaseId, paymentData);
    return { success: true };
  } catch (error) {
    console.error('Error processing payment row:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};