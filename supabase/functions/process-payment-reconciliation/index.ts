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
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    console.log('Processing CSV with headers:', headers);
    
    let processedCount = 0;
    const unmatched = [];

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim());
        const record: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          record[header] = values[index] || null;
        });

        // Find customer by name with fuzzy matching
        const { data: customers } = await supabase
          .from('profiles')
          .select('id, full_name')
          .textSearch('full_name', record['Customer Name'], {
            config: 'english',
            type: 'websearch'
          });

        let customerId = null;
        let matchConfidence = 0;

        if (customers && customers.length > 0) {
          // Simple string similarity scoring
          const similarity = calculateStringSimilarity(
            record['Customer Name'].toLowerCase(),
            customers[0].full_name.toLowerCase()
          );
          
          if (similarity > 0.8) {
            customerId = customers[0].id;
            matchConfidence = similarity;
          }
        }

        // If no match found, create AI-generated profile
        if (!customerId) {
          const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
              full_name: record['Customer Name'],
              is_ai_generated: true,
              ai_confidence_score: 0.7,
              needs_review: true
            })
            .select()
            .single();

          if (profileError) throw profileError;
          
          customerId = newProfile.id;
          matchConfidence = 0.7;
        }

        // Create payment record
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .insert({
            amount: parseFloat(record['Amount']),
            transaction_id: record['Transaction ID'],
            payment_date: record['Payment Date'],
            status: 'pending'
          })
          .select()
          .single();

        if (paymentError) throw paymentError;

        // Create matching log
        await supabase
          .from('payment_matching_logs')
          .insert({
            payment_id: payment.id,
            customer_id: customerId,
            match_confidence: matchConfidence,
            is_ai_matched: true,
            matching_factors: {
              name_similarity: matchConfidence,
              payment_details: record
            }
          });

        processedCount++;
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        unmatched.push({
          row: i,
          error: error.message
        });
      }
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

// Simple Levenshtein distance implementation for string similarity
function calculateStringSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator,
      );
    }
  }
  const distance = track[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}