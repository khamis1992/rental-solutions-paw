import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkPaymentDetails {
  firstChequeNumber: string;
  totalCheques: number;
  amount: string;
  startDate: string;
  draweeBankName: string;
  contractId: string;
}

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Log request method and headers for debugging
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    // Get and log raw request body
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Parse request body
    let details: BulkPaymentDetails;
    try {
      details = JSON.parse(rawBody);
    } catch (error) {
      console.error('JSON parsing error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON format',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Validate required fields
    const requiredFields = ['firstChequeNumber', 'totalCheques', 'amount', 'startDate', 'draweeBankName', 'contractId'];
    const missingFields = requiredFields.filter(field => !details[field as keyof BulkPaymentDetails]);
    
    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          missingFields 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Extract and validate cheque number format
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

    // Generate payment records
    const payments = Array.from({ length: details.totalCheques }, (_, index) => {
      const chequeNumber = `${prefix}${String(Number(baseNumber) + index).padStart(baseNumber.length, '0')}`;
      const paymentDate = new Date(details.startDate);
      paymentDate.setMonth(paymentDate.getMonth() + index);

      return {
        contract_id: details.contractId,
        cheque_number: chequeNumber,
        amount: Number(details.amount),
        payment_date: paymentDate.toISOString(),
        drawee_bank: details.draweeBankName,
        paid_amount: 0,
        remaining_amount: Number(details.amount),
        status: 'pending'
      };
    });

    // Check for duplicate cheque numbers
    const { data: existingCheques, error: checkError } = await supabase
      .from('car_installment_payments')
      .select('cheque_number')
      .in('cheque_number', payments.map(p => p.cheque_number));

    if (checkError) {
      console.error('Error checking duplicates:', checkError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check for duplicate cheque numbers',
          details: checkError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    if (existingCheques && existingCheques.length > 0) {
      const duplicates = existingCheques.map(c => c.cheque_number).join(', ');
      return new Response(
        JSON.stringify({ 
          error: 'Duplicate cheque numbers found',
          duplicates 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Insert payments one by one
    for (const payment of payments) {
      const { error: insertError } = await supabase
        .from('car_installment_payments')
        .insert([payment]);

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to insert payment',
            details: insertError.message,
            payment 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        );
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bulk payments created successfully',
        count: payments.length
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
        message: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})