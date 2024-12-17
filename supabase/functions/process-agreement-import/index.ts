import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting agreement import process...');
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    if (!fileName) {
      throw new Error('fileName is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    // Update import log status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      const values = rows[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        try {
          const customerIdentifier = values[headers.indexOf('customer_identifier')];
          const vehicleId = values[headers.indexOf('vehicle_id')];
          const startDate = values[headers.indexOf('start_date')];
          const endDate = values[headers.indexOf('end_date')];
          const totalAmount = parseFloat(values[headers.indexOf('total_amount')]);
          const initialMileage = parseInt(values[headers.indexOf('initial_mileage')]);
          const agreementType = values[headers.indexOf('agreement_type')];
          const downPayment = parseFloat(values[headers.indexOf('down_payment')]) || null;
          const monthlyPayment = parseFloat(values[headers.indexOf('monthly_payment')]) || null;
          const interestRate = parseFloat(values[headers.indexOf('interest_rate')]) || null;
          const leaseDuration = values[headers.indexOf('lease_duration')] || null;

          if (!customerIdentifier || !vehicleId || !startDate || !endDate || !totalAmount) {
            throw new Error('Missing required fields');
          }

          // Get customer ID from identifier using full name
          const { data: customerData, error: customerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', customerIdentifier.trim())
            .single();

          if (customerError || !customerData) {
            throw new Error(`Customer "${customerIdentifier}" not found`);
          }

          // Verify vehicle exists and is available
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, status')
            .eq('id', vehicleId)
            .single();

          if (vehicleError || !vehicleData) {
            throw new Error(`Vehicle with ID "${vehicleId}" not found`);
          }

          if (vehicleData.status !== 'available') {
            throw new Error(`Vehicle with ID "${vehicleId}" is not available`);
          }

          // Create lease record
          const { error: leaseError } = await supabase
            .from('leases')
            .insert({
              customer_id: customerData.id,
              vehicle_id: vehicleId,
              start_date: startDate,
              end_date: endDate,
              total_amount: totalAmount,
              initial_mileage: initialMileage,
              agreement_type: agreementType,
              down_payment: downPayment,
              monthly_payment: monthlyPayment,
              interest_rate: interestRate,
              lease_duration: leaseDuration ? `${leaseDuration} months` : null,
              status: 'pending'
            });

          if (leaseError) {
            throw leaseError;
          }

          // Update vehicle status
          await supabase
            .from('vehicles')
            .update({ status: 'leased' })
            .eq('id', vehicleId);

          successCount++;
          console.log(`Successfully imported agreement for customer: ${customerIdentifier}`);

        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
          errors.push({
            row: i + 1,
            error: error.message
          });

          // Log the error in agreement_import_errors
          await supabase
            .from('agreement_import_errors')
            .insert({
              import_log_id: (await supabase
                .from('import_logs')
                .select('id')
                .eq('file_name', fileName)
                .single()).data?.id,
              row_number: i + 1,
              customer_identifier: values[headers.indexOf('customer_identifier')],
              error_message: error.message,
              row_data: Object.fromEntries(headers.map((h, idx) => [h, values[idx]]))
            });
        }
      }
    }

    // Update import log with final status
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount,
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
        status: 200,
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