import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Always handle CORS preflight requests first
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting customer import process...');
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    // Validate input
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
    const timestamp = Date.now();

    // Update import log status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      const values = rows[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        try {
          // Generate unique email and password
          const randomString = Math.random().toString(36).substring(7);
          const email = `customer${i}_${timestamp}_${randomString}@example.com`;
          const password = crypto.randomUUID();

          // Create customer profile data object
          const customerData = {
            full_name: values[headers.indexOf('full_name')] || values[headers.indexOf('name')],
            phone_number: values[headers.indexOf('phone_number')] || values[headers.indexOf('phone')],
            address: values[headers.indexOf('address')],
            driver_license: values[headers.indexOf('driver_license')],
            role: 'customer'
          };

          console.log('Processing customer:', customerData);

          // Check if profile already exists with the same name
          const { data: existingProfiles } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', customerData.full_name)
            .limit(1);

          if (existingProfiles && existingProfiles.length > 0) {
            console.log(`Profile already exists for ${customerData.full_name}, updating...`);
            
            // Update existing profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update(customerData)
              .eq('id', existingProfiles[0].id);

            if (updateError) {
              throw updateError;
            }
            
            successCount++;
            continue;
          }

          // Create auth user first
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          });

          if (authError) {
            throw authError;
          }

          // Create profile with the auth user's ID
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              ...customerData,
              id: authData.user.id,
            });

          if (profileError) {
            throw profileError;
          }

          successCount++;
          console.log(`Successfully imported customer: ${customerData.full_name}`);

        } catch (error) {
          console.error(`Error processing row ${i}:`, error);
          errorCount++;
        }
      } else {
        console.warn(`Skipping row ${i}: invalid number of columns`);
        errorCount++;
      }
    }

    // Update import log with final status
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount,
        errors: errorCount
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} records with ${errorCount} errors.`,
        processed: successCount,
        errors: errorCount
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