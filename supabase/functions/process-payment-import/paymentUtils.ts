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
  // Expected format: DD-MM-YYYY
  const [day, month, year] = dateStr.split('-').map(num => parseInt(num, 10));
  
  // Create date using local timezone to avoid UTC conversion issues
  const date = new Date(year, month - 1, day);
  
  // Validate the date
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateStr}. Expected format: DD-MM-YYYY`);
  }
  
  return date;
};

export const createPaymentRecord = async (
  supabase: any,
  leaseId: string,
  paymentData: PaymentData
) => {
  try {
    const paymentDate = parseDate(paymentData.paymentDate);
    console.log('Parsed payment date:', paymentDate);

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
    const paymentData: PaymentData = {
      customerName: values[headers.indexOf('Customer Name')],
      amount: parseFloat(values[headers.indexOf('Amount')]),
      paymentDate: values[headers.indexOf('Payment_Date')],
      paymentMethod: values[headers.indexOf('Payment_Method')],
      status: values[headers.indexOf('status')],
      paymentNumber: values[headers.indexOf('Payment_Number')],
    };

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