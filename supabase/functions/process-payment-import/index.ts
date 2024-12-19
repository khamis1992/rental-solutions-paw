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
    const skippedRecords = [];
    const failedRecords = [];

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

        console.log(`Processing row ${i}:`, record);

        // Parse date (DD-MM-YYYY format)
        let paymentDate = null;
        if (record.Payment_Date) {
          const [day, month, year] = record.Payment_Date.split('-');
          if (day && month && year) {
            paymentDate = `${year}-${month}-${day}`;
          }
        }

        // If essential data is missing, log it but continue processing
        if (!record['Customer Name'] || !record.Amount) {
          console.log(`Row ${i}: Missing essential data`, record);
          skippedRecords.push({
            row: i,
            data: record,
            reason: 'Missing essential data'
          });
          continue;
        }

        // Find customer and active lease
        const { data: customerData } = await supabase
          .from('profiles')
          .select('id')
          .ilike('full_name', record['Customer Name'])
          .maybeSingle();

        if (!customerData?.id) {
          console.log(`Row ${i}: Customer not found`, record['Customer Name']);
          skippedRecords.push({
            row: i,
            data: record,
            reason: 'Customer not found'
          });
          continue;
        }

        const { data: leaseData } = await supabase
          .from('leases')
          .select('id')
          .eq('customer_id', customerData.id)
          .in('status', ['active', 'pending_payment'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!leaseData?.id) {
          console.log(`Row ${i}: No active lease found for customer`, record['Customer Name']);
          skippedRecords.push({
            row: i,
            data: record,
            reason: 'No active lease found'
          });
          continue;
        }

        // Insert payment record
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            lease_id: leaseData.id,
            amount: parseFloat(record.Amount) || 0,
            status: record.status || 'completed',
            payment_date: paymentDate || new Date().toISOString(),
            payment_method: record.Payment_Method || 'unknown',
            transaction_id: record.Payment_Number || crypto.randomUUID()
          });

        if (paymentError) {
          console.error(`Row ${i}: Payment insertion error`, paymentError);
          failedRecords.push({
            row: i,
            data: record,
            error: paymentError.message
          });
          continue;
        }

        processedCount++;
        console.log(`Successfully processed payment for row ${i}`);

      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        failedRecords.push({
          row: i,
          error: error.message
        });
      }
    }

    // Update import log with results
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: processedCount,
        errors: {
          skipped: skippedRecords,
          failed: failedRecords
        }
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        skipped: skippedRecords.length,
        failed: failedRecords.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Import process failed:', error);
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