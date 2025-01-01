import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentAnalysis {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  rawData: any[];
  issues?: string[];
  suggestions?: string[];
}

interface RequestPayload {
  analysisResult: PaymentAnalysis;
}

const validateAnalysisResult = (data: any): data is PaymentAnalysis => {
  try {
    console.log('Starting validation of analysis result');
    
    if (!data) {
      console.error('Analysis result is null or undefined');
      return false;
    }

    if (typeof data !== 'object') {
      console.error('Analysis result is not an object, type:', typeof data);
      return false;
    }

    console.log('Analysis result structure:', Object.keys(data));

    const requiredFields = ['success', 'totalRows', 'validRows', 'invalidRows', 'totalAmount', 'rawData'];
    const missingFields = requiredFields.filter(field => {
      const hasField = data[field] !== undefined && data[field] !== null;
      if (!hasField) {
        console.error(`Missing or invalid field: ${field}, value:`, data[field]);
      }
      return !hasField;
    });
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return false;
    }

    if (!Array.isArray(data.rawData)) {
      console.error('rawData is not an array, type:', typeof data.rawData);
      return false;
    }

    console.log('Validation successful');
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing payment import request...');
    
    // Initialize Supabase client with error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Parse and validate request body with detailed error handling
    let payload: RequestPayload;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      
      if (!text) {
        throw new Error('Request body is empty');
      }

      payload = JSON.parse(text);
      console.log('Parsed payload:', JSON.stringify(payload, null, 2));
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON payload',
          details: error.message
        }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate analysis result with improved error messages
    if (!payload.analysisResult || !validateAnalysisResult(payload.analysisResult)) {
      console.error('Invalid analysis result structure');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid analysis result structure. Required fields missing or invalid.',
          expectedFields: ['success', 'totalRows', 'validRows', 'invalidRows', 'totalAmount', 'rawData']
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { analysisResult } = payload;
    console.log('Processing', analysisResult.rawData.length, 'payment records');

    // Process each payment record with enhanced error handling
    const results = await Promise.all(
      analysisResult.rawData.map(async (payment) => {
        try {
          if (!payment.lease_id || !payment.amount || !payment.payment_date) {
            throw new Error('Missing required payment fields');
          }

          const { error: insertError } = await supabaseClient
            .from('payments')
            .insert({
              lease_id: payment.lease_id,
              amount: parseFloat(payment.amount),
              payment_date: payment.payment_date,
              payment_method: payment.payment_method || 'cash',
              status: payment.status || 'completed',
              description: payment.description,
              transaction_id: payment.transaction_id
            });

          if (insertError) throw insertError;
          return { success: true, payment };
        } catch (error) {
          console.error('Error processing payment:', error);
          return { success: false, payment, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const errors = results.filter(r => !r.success);

    console.log(`Successfully processed ${successCount} payments with ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Successfully processed ${successCount} payments with ${errors.length} errors`,
        processed: successCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});