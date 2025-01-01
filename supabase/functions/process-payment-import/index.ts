import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PaymentData {
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  status?: string;
  description?: string;
  transaction_id?: string;
}

interface PaymentAnalysis {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  rawData: PaymentData[];
  issues?: string[];
  suggestions?: string[];
}

const validateAnalysisResult = (result: any): result is PaymentAnalysis => {
  console.log('Validating analysis result:', result);
  
  if (!result || typeof result !== 'object') {
    console.error('Analysis result is not an object');
    return false;
  }

  const requiredFields = [
    'success',
    'totalRows',
    'validRows',
    'invalidRows',
    'totalAmount',
    'rawData'
  ];

  const missingFields = requiredFields.filter(field => !(field in result));
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return false;
  }

  if (!Array.isArray(result.rawData)) {
    console.error('rawData is not an array');
    return false;
  }

  return true;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)
    
    const payload = await req.json()
    console.log('Received payload:', payload)

    if (!payload.analysisResult) {
      console.error('Missing analysisResult in payload');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing analysis result'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    if (!validateAnalysisResult(payload.analysisResult)) {
      console.error('Invalid analysis result structure:', payload.analysisResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid analysis result structure'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    const { rawData } = payload.analysisResult;
    console.log('Processing payments:', rawData);

    // Process payments in batches
    const batchSize = 50;
    const results = [];
    let successCount = 0;
    const errors = [];

    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, Math.min(i + batchSize, rawData.length));
      
      try {
        const { data, error } = await supabaseClient
          .from('payments')
          .insert(batch.map(payment => ({
            lease_id: payment.lease_id,
            amount: payment.amount,
            payment_date: payment.payment_date,
            payment_method: payment.payment_method || 'cash',
            status: payment.status || 'completed',
            description: payment.description,
            transaction_id: payment.transaction_id
          })))
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message
          });
        } else {
          console.log(`Successfully inserted ${data.length} payments`);
          successCount += data.length;
          results.push(...data);
        }
      } catch (error) {
        console.error(`Error processing batch ${i + 1}-${i + batch.length}:`, error);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: successCount,
        errors: errors.length > 0 ? errors : undefined,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing payment import:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})