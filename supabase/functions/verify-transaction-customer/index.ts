import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { agreementNumber, paymentDate } = await req.json();
    console.log('Received request:', { agreementNumber, paymentDate });

    // Validate required parameters
    if (!agreementNumber || !paymentDate) {
      console.error('Missing required parameters:', { agreementNumber, paymentDate });
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters',
          details: { agreementNumber, paymentDate }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      throw new Error('Server configuration error');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('Verifying customer for:', { agreementNumber, paymentDate });

    // Query the database
    const { data: agreements, error: agreementError } = await supabaseClient
      .from('leases')
      .select(`
        id,
        customer_id,
        start_date,
        end_date,
        status,
        profiles:customer_id (
          full_name
        )
      `)
      .eq('agreement_number', agreementNumber)
      .single();

    if (agreementError) {
      console.error('Error fetching agreement:', agreementError);
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch agreement details',
          details: agreementError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (!agreements) {
      console.log('No agreement found for:', agreementNumber);
      return new Response(
        JSON.stringify({
          data: {
            customerName: 'Unknown',
            isValidDate: false,
            message: `No active agreement found for number ${agreementNumber}`
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Validate payment date against agreement dates
    const paymentDateObj = new Date(paymentDate);
    const startDate = new Date(agreements.start_date);
    const endDate = agreements.end_date ? new Date(agreements.end_date) : null;

    const isValidDate = paymentDateObj >= startDate && 
      (!endDate || paymentDateObj <= endDate);

    console.log('Validation result:', {
      customerName: agreements.profiles?.full_name || 'Unknown',
      isValidDate,
      agreement: agreements
    });

    // Return response with CORS headers
    return new Response(
      JSON.stringify({
        data: {
          customerName: agreements.profiles?.full_name || 'Unknown',
          isValidDate,
          message: isValidDate ? 
            'Payment date is within agreement period' : 
            'Payment date is outside agreement period'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});