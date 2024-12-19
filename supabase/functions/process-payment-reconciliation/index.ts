import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BATCH_SIZE = 50; // Process 50 records at a time

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('Processing CSV with headers:', headers);
    
    let processedCount = 0;
    const unmatched = [];

    // Process in batches
    for (let i = 1; i < lines.length; i += BATCH_SIZE) {
      const batch = lines.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}`);

      const batchPromises = batch.map(async (line, index) => {
        const lineNumber = i + index;
        try {
          const values = line.split(',').map(v => v.trim());
          const record = {};
          
          headers.forEach((header, index) => {
            record[header] = values[index] || null;
          });

          // Create payment record
          const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
              amount: parseFloat(record['Amount']),
              transaction_id: record['Transaction ID'],
              payment_date: new Date().toISOString(),
              status: 'pending'
            })
            .select()
            .single();

          if (paymentError) throw paymentError;

          // Create reconciliation record
          await supabase
            .from('payment_reconciliation')
            .insert({
              payment_id: payment.id,
              reconciliation_status: 'pending',
              match_confidence: 0.8,
              auto_matched: true
            });

          processedCount++;
        } catch (error) {
          console.error(`Error processing row ${lineNumber}:`, error);
          unmatched.push({
            row: lineNumber,
            error: error.message
          });
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        unmatched: unmatched.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Payment reconciliation process failed:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
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