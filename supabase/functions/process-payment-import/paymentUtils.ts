import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface PaymentData {
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  paymentNumber: string;
}

export const findCustomerWithActiveLease = async (
  supabase: SupabaseClient,
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

export const createPaymentRecord = async (
  supabase: SupabaseClient,
  leaseId: string,
  paymentData: PaymentData
) => {
  const [day, month, year] = paymentData.paymentDate.split('-');
  const isoDate = `${year}-${month}-${day}`;

  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      lease_id: leaseId,
      amount: paymentData.amount,
      status: paymentData.status,
      payment_date: new Date(isoDate).toISOString(),
      payment_method: paymentData.paymentMethod,
      transaction_id: paymentData.paymentNumber,
    });

  if (paymentError) {
    throw paymentError;
  }
};

export const processPaymentRow = async (
  supabase: SupabaseClient,
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