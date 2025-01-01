import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './corsHeaders';
import { validatePaymentRow } from './validators';

export const processPayments = async (supabaseClient: any, rawData: any[]) => {
  console.log('Starting payment processing for', rawData.length, 'records');
  
  const payments = rawData.map(row => {
    try {
      validatePaymentRow(row);
      
      // Parse the date string (assuming format DD-MM-YYYY)
      let paymentDate;
      try {
        if (row.payment_date.includes('-')) {
          const [day, month, year] = row.payment_date.split('-').map(Number);
          paymentDate = new Date(year, month - 1, day);
        } else {
          paymentDate = new Date(row.payment_date);
        }

        if (isNaN(paymentDate.getTime())) {
          throw new Error(`Invalid date format for payment: ${row.payment_date}`);
        }
      } catch (error) {
        console.error('Date parsing error:', error);
        throw new Error(`Invalid date format: ${row.payment_date}`);
      }

      return {
        lease_id: row.lease_id,
        amount: parseFloat(row.amount),
        payment_date: paymentDate.toISOString(),
        payment_method: row.payment_method,
        status: 'completed',
        description: row.description,
        transaction_id: row.transaction_id
      };
    } catch (error) {
      console.error('Row validation error:', error, row);
      throw error;
    }
  });

  console.log('Prepared payments for insertion:', payments);

  // Insert payments in batches
  const batchSize = 50;
  const errors = [];
  let successCount = 0;

  for (let i = 0; i < payments.length; i += batchSize) {
    const batch = payments.slice(i, Math.min(i + batchSize, payments.length));
    
    try {
      console.log(`Processing batch ${i/batchSize + 1}:`, batch);
      
      const { data, error: insertError } = await supabaseClient
        .from('payments')
        .insert(batch)
        .select();

      if (insertError) {
        console.error('Batch insert error:', insertError);
        errors.push({
          batch: i/batchSize + 1,
          error: insertError.message
        });
      } else {
        console.log(`Successfully inserted ${data?.length} payments`);
        successCount += data?.length || 0;
      }
    } catch (error: any) {
      console.error(`Error processing batch ${i + 1}-${i + batch.length}:`, error);
      errors.push({
        batch: i/batchSize + 1,
        error: error.message
      });
    }
  }

  return { successCount, errors };
};