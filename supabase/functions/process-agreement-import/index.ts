import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

// Map common status values to our enum values
const statusMapping: { [key: string]: string } = {
  'active': 'active',
  'pending': 'pending',
  'completed': 'completed',
  'cancelled': 'cancelled',
  'closed': 'completed', // Map 'closed' to 'completed'
  'done': 'completed',
  'cancel': 'cancelled',
  'canceled': 'cancelled'
};

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
          // Extract values with validation
          const rowData = {
            agreementNumber: values[headers.indexOf('Agreement Number')]?.trim(),
            licenseNo: values[headers.indexOf('License No')]?.trim(),
            fullName: values[headers.indexOf('full_name')]?.trim(),
            licenseNumber: values[headers.indexOf('License Number')]?.trim(),
            checkoutDate: values[headers.indexOf('Check-out Date')]?.trim(),
            checkinDate: values[headers.indexOf('Check-in Date')]?.trim(),
            returnDate: values[headers.indexOf('Return Date')]?.trim(),
            status: values[headers.indexOf('STATUS')]?.trim()?.toLowerCase(),
          };

          // Validate required fields
          const missingFields = [];
          if (!rowData.agreementNumber) missingFields.push('Agreement Number');
          if (!rowData.fullName) missingFields.push('full_name');
          if (!rowData.status) missingFields.push('STATUS');

          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }

          // Map status to valid enum value
          const mappedStatus = statusMapping[rowData.status];
          if (!mappedStatus) {
            throw new Error(`Invalid status value: ${rowData.status}. Allowed values are: ${Object.keys(statusMapping).join(', ')}`);
          }

          // Get customer ID from full name
          const { data: customerData, error: customerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', rowData.fullName)
            .single();

          if (customerError || !customerData) {
            throw new Error(`Customer "${rowData.fullName}" not found`);
          }

          // Create lease record
          const { error: leaseError } = await supabase
            .from('leases')
            .insert({
              customer_id: customerData.id,
              agreement_number: rowData.agreementNumber,
              license_no: rowData.licenseNo,
              license_number: rowData.licenseNumber,
              checkout_date: rowData.checkoutDate,
              checkin_date: rowData.checkinDate,
              return_date: rowData.returnDate,
              status: mappedStatus,
            });

          if (leaseError) {
            throw leaseError;
          }

          successCount++;
          console.log(`Successfully imported agreement: ${rowData.agreementNumber}`);

        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
          errors.push({
            row: i + 1,
            error: error.message,
            data: Object.fromEntries(headers.map((h, idx) => [h, values[idx]]))
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
              customer_identifier: values[headers.indexOf('full_name')],
              error_message: error.message,
              row_data: Object.fromEntries(headers.map((h, idx) => [h, values[idx]]))
            });
        }
      } else {
        console.error(`Row ${i + 1} has incorrect number of columns`);
        errorCount++;
        errors.push({
          row: i + 1,
          error: 'Incorrect number of columns',
          expected: headers.length,
          found: values.length
        });
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