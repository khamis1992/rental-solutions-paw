import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from './corsHeaders.ts';
import { parseDate } from './dateUtils.ts';
import { normalizeStatus } from './statusUtils.ts';
import type { ImportRequest, AgreementData, BatchError } from './types.ts';

console.log("Loading agreement import function...");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }

  try {
    console.log('Starting agreement import process...');
    
    // Parse request body with error handling
    let requestData: ImportRequest;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      requestData = JSON.parse(rawBody);
    } catch (error) {
      console.error('Error parsing request body:', error);
      throw new Error('Invalid JSON in request body');
    }

    console.log('Parsed request body:', requestData);
    
    const { fileName } = requestData;
    if (!fileName) {
      throw new Error('fileName is required');
    }

    console.log('Extracted fileName:', fileName);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download and process the file
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',').map(h => h.trim());
    
    let successCount = 0;
    let errorCount = 0;
    const errors: BatchError[] = [];
    const batchSize = 50;
    const agreements: AgreementData[] = [];

    // Get default vehicle for testing
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('status', 'available')
      .limit(1)
      .single();

    const defaultVehicleId = vehicle?.id;

    // Process rows in batches
    for (let i = 1; i < rows.length; i++) {
      try {
        console.log(`Processing row ${i}:`, rows[i]);
        const values = rows[i].split(',').map(v => v.trim());
        
        const agreementNumber = values[headers.indexOf('Agreement Number')]?.trim() || `AGR${Date.now()}`;
        const licenseNo = values[headers.indexOf('License No')]?.trim();
        const fullName = values[headers.indexOf('full_name')]?.trim();
        const licenseNumber = values[headers.indexOf('License Number')]?.trim();
        const checkoutDate = parseDate(values[headers.indexOf('Check-out Date')]?.trim());
        const checkinDate = parseDate(values[headers.indexOf('Check-in Date')]?.trim());
        const returnDate = parseDate(values[headers.indexOf('Return Date')]?.trim());
        const status = normalizeStatus(values[headers.indexOf('STATUS')]?.trim());

        // Get or create customer profile
        let customerId: string | null = null;
        try {
          const { data: existingCustomer } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', fullName)
            .single();

          if (existingCustomer) {
            customerId = existingCustomer.id;
          } else {
            const { data: newCustomer } = await supabase
              .from('profiles')
              .insert({
                full_name: fullName || `Unknown Customer ${Date.now()}`,
                role: 'customer'
              })
              .select()
              .single();
            
            customerId = newCustomer?.id;
          }
        } catch (error) {
          console.error('Error with customer profile:', error);
          const { data: newCustomer } = await supabase
            .from('profiles')
            .insert({
              full_name: `Unknown Customer ${Date.now()}`,
              role: 'customer'
            })
            .select()
            .single();
          
          customerId = newCustomer?.id;
        }

        agreements.push({
          agreement_number: agreementNumber,
          license_no: licenseNo,
          license_number: licenseNumber,
          checkout_date: checkoutDate,
          checkin_date: checkinDate,
          return_date: returnDate,
          status,
          customer_id: customerId,
          vehicle_id: defaultVehicleId,
          total_amount: 0,
          initial_mileage: 0
        });

        // Process in batches
        if (agreements.length === batchSize || i === rows.length - 1) {
          const { error: batchError } = await supabase
            .from('leases')
            .upsert(agreements, {
              onConflict: 'agreement_number',
              ignoreDuplicates: false
            });

          if (batchError) {
            console.error('Batch insert error:', batchError);
            errorCount += agreements.length;
            errors.push({
              rows: `${i - agreements.length + 1} to ${i}`,
              error: batchError.message
            });
          } else {
            successCount += agreements.length;
          }
          
          agreements.length = 0;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          rows: i.toString(),
          error: error.message
        });
        errorCount++;
      }
    }

    // Update import log
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount + errorCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} agreements with ${errorCount} errors.`,
        processed: successCount,
        errors: errorCount,
        errorDetails: errors
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Import process failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});