import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData = await req.json();
    const { operation, data } = requestData;
    
    console.log('Processing payment request:', { operation, data });

    if (operation !== 'process_payment') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid operation'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { leaseId, amount, paymentMethod = 'Cash', description = '', type } = data;

    // Validate required parameters
    if (!leaseId || !amount || !type) {
      console.error('Missing required parameters:', { leaseId, amount, type });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the next due payment from payment schedules
    const { data: nextPayment, error: scheduleError } = await supabase
      .from('payment_schedules')
      .select('*')
      .eq('lease_id', leaseId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (scheduleError) {
      console.error('Error fetching payment schedule:', scheduleError);
      throw scheduleError;
    }

    const paymentDate = new Date().toISOString();
    const originalDueDate = nextPayment?.due_date || paymentDate;
    
    // Calculate late fee if payment is overdue
    const lateFee = nextPayment && new Date(nextPayment.due_date) < new Date() ? 
      calculateLateFee(new Date(nextPayment.due_date), new Date()) : 0;

    // Insert payment first
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount: Number(amount),
        amount_paid: Number(amount),
        balance: 0,
        payment_method: paymentMethod,
        description: description,
        type: type,
        status: 'completed',
        payment_date: paymentDate,
        include_in_calculation: true,
        late_fine_amount: lateFee
      })
      .select('id, amount, payment_date, status')
      .single();

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process payment',
          details: paymentError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Then create payment history record
    const { error: historyError } = await supabase
      .from('payment_history')
      .insert({
        lease_id: leaseId,
        payment_id: payment.id,
        original_due_date: originalDueDate,
        actual_payment_date: paymentDate,
        amount_due: Number(amount),
        amount_paid: Number(amount),
        late_fee_applied: lateFee,
        remaining_balance: 0,
        status: 'completed'
      });

    if (historyError) {
      console.error('Payment history insert error:', historyError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment history',
          details: historyError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update payment schedule status if it exists
    if (nextPayment) {
      const { error: updateError } = await supabase
        .from('payment_schedules')
        .update({ status: 'completed' })
        .eq('id', nextPayment.id);

      if (updateError) {
        console.error('Error updating payment schedule:', updateError);
      }
    }

    console.log('Payment processed successfully:', payment);

    return new Response(
      JSON.stringify({
        success: true,
        data: payment
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function calculateLateFee(dueDate: Date, paymentDate: Date): number {
  const diffTime = Math.abs(paymentDate.getTime() - dueDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  // Default late fee is 120 QAR per day after grace period
  const DAILY_LATE_FEE = 120;
  const GRACE_PERIOD_DAYS = 3;
  
  return diffDays > GRACE_PERIOD_DAYS ? 
    (diffDays - GRACE_PERIOD_DAYS) * DAILY_LATE_FEE : 0;
}