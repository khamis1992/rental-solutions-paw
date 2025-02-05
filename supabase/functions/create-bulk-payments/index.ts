import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Request received:', req.method);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let details;
    try {
      details = JSON.parse(rawBody);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate required fields
    if (!details.firstChequeNumber || !details.totalCheques || !details.amount || 
        !details.startDate || !details.draweeBankName || !details.contractId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const baseNumber = details.firstChequeNumber.replace(/\D/g, '');
    const prefix = details.firstChequeNumber.replace(/\d/g, '');

    if (!baseNumber) {
      return new Response(
        JSON.stringify({ error: 'Invalid cheque number format' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const payments = Array.from({ length: details.totalCheques }, (_, index) => {
      const paymentDate = new Date(details.startDate);
      paymentDate.setMonth(paymentDate.getMonth() + index);

      return {
        contract_id: details.contractId,
        cheque_number: `${prefix}${String(Number(baseNumber) + index).padStart(baseNumber.length, '0')}`,
        amount: Number(details.amount),
        payment_date: paymentDate.toISOString(),
        drawee_bank: details.draweeBankName,
        paid_amount: 0,
        remaining_amount: Number(details.amount),
        status: 'pending'
      };
    });

    console.log('Generated payments:', payments);

    const results = [];
    for (const payment of payments) {
      try {
        // First check if cheque number exists
        const { data: existingCheque } = await supabase
          .from('car_installment_payments')
          .select('cheque_number')
          .eq('cheque_number', payment.cheque_number)
          .single();

        if (existingCheque) {
          console.log('Duplicate cheque found:', payment.cheque_number);
          results.push({ 
            success: false, 
            chequeNumber: payment.cheque_number, 
            error: 'Cheque number already exists' 
          });
          continue;
        }

        // Insert new payment without ON CONFLICT clause
        const { error: insertError } = await supabase
          .from('car_installment_payments')
          .insert([payment]);

        if (insertError) {
          console.error('Error inserting payment:', insertError);
          results.push({ 
            success: false, 
            chequeNumber: payment.cheque_number, 
            error: insertError.message 
          });
          continue;
        }
        
        results.push({ 
          success: true, 
          chequeNumber: payment.cheque_number 
        });
      } catch (error) {
        console.error('Error processing payment:', error);
        results.push({ 
          success: false, 
          chequeNumber: payment.cheque_number, 
          error: error.message 
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bulk payments processed',
        results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unhandled error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})