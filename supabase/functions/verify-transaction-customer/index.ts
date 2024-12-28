import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { agreementNumber, paymentDate } = await req.json()

    if (!agreementNumber || !paymentDate) {
      throw new Error('Agreement number and payment date are required')
    }

    console.log('Verifying customer for:', { agreementNumber, paymentDate });

    const { data: agreements, error: agreementError } = await supabaseClient
      .from('leases')
      .select(`
        id,
        agreement_number,
        start_date,
        end_date,
        customer:profiles!leases_customer_id_fkey (
          id,
          full_name
        )
      `)
      .eq('agreement_number', agreementNumber)
      .lte('start_date', paymentDate)
      .gte('end_date', paymentDate)
      .order('created_at', { ascending: false })
      .limit(1);

    if (agreementError) {
      console.error('Agreement query error:', agreementError);
      throw agreementError;
    }

    if (!agreements || agreements.length === 0) {
      console.log('No active agreement found for:', { agreementNumber, paymentDate });
      return new Response(
        JSON.stringify({
          success: false,
          data: {
            customerId: null,
            customerName: null,
            isValidDate: false,
            message: 'No active agreement found for this period'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const agreement = agreements[0];
    const paymentDateObj = new Date(paymentDate);
    const startDate = new Date(agreement.start_date);
    const endDate = agreement.end_date ? new Date(agreement.end_date) : null;

    const isValidDate = paymentDateObj >= startDate && 
      (!endDate || paymentDateObj <= endDate);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          customerId: agreement.customer?.id,
          customerName: agreement.customer?.full_name,
          isValidDate,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error verifying customer:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        data: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
})