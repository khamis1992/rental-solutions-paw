import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./corsHeaders.ts";
import { DatabaseOperations } from "./dbOperations.ts";
import { PaymentRequest } from "./types.ts";

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error',
          details: 'Missing required environment variables'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Parse request body
    let requestData: PaymentRequest;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      requestData = JSON.parse(text);
      console.log('Parsed request data:', requestData);
    } catch (error) {
      console.error('Request parsing error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request format',
          details: error instanceof Error ? error.message : 'Failed to parse request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { operation, data } = requestData;
    
    if (operation !== 'process_payment') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid operation',
          details: { operation, supported: ['process_payment'] }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Initialize database operations
    const db = new DatabaseOperations(supabaseUrl, supabaseKey);

    // Process payment
    const { leaseId, amount, paymentMethod = 'Cash', description = '', type } = data;

    // Verify required fields
    if (!leaseId || typeof leaseId !== 'string') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid lease ID format',
          details: { leaseId, expectedType: 'string' }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Verify lease exists
    await db.verifyLease(leaseId);

    // Create payment
    const payment = await db.createPayment({
      leaseId,
      amount: Number(amount),
      paymentMethod,
      description,
      type
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: payment
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});