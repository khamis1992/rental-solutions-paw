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

export const createPaymentRecord = async (
  supabase: any,
  leaseId: string,
  paymentData: PaymentData
) => {
  let isoDate;
  
  try {
    // Try to parse the date, but use current date if parsing fails
    if (paymentData.paymentDate) {
      const [day, month, year] = paymentData.paymentDate.split('-').map(num => num?.trim());
      if (day && month && year) {
        isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`;
      }
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }

  // If date parsing failed, use current date
  if (!isoDate) {
    isoDate = new Date().toISOString();
    console.log('Using current date for payment:', isoDate);
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      lease_id: leaseId,
      amount: paymentData.amount || 0,
      status: paymentData.status || 'pending',
      payment_date: isoDate,
      payment_method: paymentData.paymentMethod || 'unknown',
      transaction_id: paymentData.paymentNumber || crypto.randomUUID(),
    });

  if (paymentError) {
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
      customerName: values[headers.indexOf('Customer Name')] || '',
      amount: parseFloat(values[headers.indexOf('Amount')]) || 0,
      paymentDate: values[headers.indexOf('Payment_Date')] || new Date().toISOString(),
      paymentMethod: values[headers.indexOf('Payment_Method')] || 'unknown',
      status: values[headers.indexOf('status')] || 'pending',
      paymentNumber: values[headers.indexOf('Payment_Number')] || crypto.randomUUID(),
    };

    if (!paymentData.customerName) {
      return {
        success: false,
        error: 'Missing customer name'
      };
    }

    if (!paymentData.amount || isNaN(paymentData.amount)) {
      return {
        success: false,
        error: 'Invalid payment amount'
      };
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