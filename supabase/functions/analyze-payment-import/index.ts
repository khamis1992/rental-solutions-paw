import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rawPaymentId } = await req.json();
    console.log('Processing raw payment:', rawPaymentId);

    // Fetch raw payment data
    const { data: rawPayment, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('id', rawPaymentId)
      .single();

    if (fetchError) {
      console.error('Error fetching raw payment:', fetchError);
      throw fetchError;
    }

    // Find the lease by agreement number
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('agreement_number', rawPayment.Agreement_Number)
      .single();

    if (leaseError) {
      console.error('Error finding lease:', leaseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `No lease found for agreement number: ${rawPayment.Agreement_Number}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Calculate late fees if applicable
    const paymentDate = new Date(rawPayment.Payment_Date);
    const dueDay = lease.rent_due_day || 1;
    const paymentMonth = paymentDate.getMonth();
    const paymentYear = paymentDate.getFullYear();
    const dueDate = new Date(paymentYear, paymentMonth, dueDay);
    
    let lateFee = 0;
    let daysOverdue = 0;
    
    if (paymentDate > dueDate) {
      daysOverdue = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      lateFee = daysOverdue * (lease.daily_late_fine || 120); // Default to 120 QAR if not set
    }

    // Process payment
    const paymentData = {
      lease_id: lease.id,
      amount: parseFloat(rawPayment.Amount),
      payment_date: rawPayment.Payment_Date,
      payment_method: rawPayment.Payment_Method,
      description: rawPayment.Description,
      status: 'completed',
      type: 'Income',
      late_fine_amount: lateFee,
      days_overdue: daysOverdue,
      transaction_id: rawPayment.Transaction_ID
    };

    const { error: insertError } = await supabase
      .from('payments')
      .insert(paymentData);

    if (insertError) {
      console.error('Error inserting payment:', insertError);
      throw insertError;
    }

    // Update raw payment status
    const { error: updateError } = await supabase
      .from('raw_payment_imports')
      .update({ is_valid: true })
      .eq('id', rawPaymentId);

    if (updateError) {
      console.error('Error updating raw payment:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully',
        payment: paymentData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});