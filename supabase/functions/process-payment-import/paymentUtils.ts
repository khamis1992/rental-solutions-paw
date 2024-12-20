import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const processPaymentRow = async (
  supabase: SupabaseClient,
  headers: string[],
  values: string[]
) => {
  try {
    // Create a record object from headers and values
    const record = headers.reduce((obj, header, index) => {
      obj[header.toLowerCase().replace(/ /g, '_')] = values[index];
      return obj;
    }, {} as Record<string, string>);

    // Validate required fields
    const requiredFields = ['amount', 'payment_date', 'payment_method'];
    const missingFields = requiredFields.filter(field => !record[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Parse and validate amount
    const amount = parseFloat(record.amount);
    if (isNaN(amount) || amount <= 0) {
      return {
        success: false,
        error: 'Invalid amount'
      };
    }

    // Parse and validate date
    const paymentDate = new Date(record.payment_date);
    if (isNaN(paymentDate.getTime())) {
      return {
        success: false,
        error: 'Invalid payment date'
      };
    }

    // Insert payment record
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        amount,
        payment_date: paymentDate.toISOString(),
        payment_method: record.payment_method,
        status: record.status || 'pending',
        transaction_id: record.payment_number
      });

    if (insertError) {
      throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error processing payment row:', error);
    return {
      success: false,
      error: error.message
    };
  }
};