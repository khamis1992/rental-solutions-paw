import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

export interface PaymentData {
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
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

export const createPaymentRecord = async (
  supabase: any,
  leaseId: string,
  paymentData: PaymentData
) => {
  const [day, month, year] = paymentData.paymentDate.split('-');
  const isoDate = `${year}-${month}-${day}`;

  // Validate payment method
  const validPaymentMethods = ['Invoice', 'Cash', 'WireTransfer', 'Cheque', 'Deposit', 'On_hold'];
  const paymentMethod = validPaymentMethods.includes(paymentData.paymentMethod)
    ? paymentData.paymentMethod
    : 'Cash'; // Default to Cash if invalid method provided

  console.log('Creating payment record with method:', paymentMethod);

  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      lease_id: leaseId,
      amount: paymentData.amount,
      status: paymentData.status,
      payment_date: new Date(isoDate).toISOString(),
      payment_method: paymentMethod,
      transaction_id: paymentData.paymentNumber,
    });

  if (paymentError) {
    console.error('Error creating payment:', paymentError);
    throw paymentError;
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
      paymentMethod: values[headers.indexOf('Payment_Method')] as PaymentData['paymentMethod'],
      status: values[headers.indexOf('status')],
      paymentNumber: values[headers.indexOf('Payment_Number')],
    };

    console.log('Processing payment data:', paymentData);

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