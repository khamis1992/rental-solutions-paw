import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the CSV file
    console.log('Downloading file from storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    console.log('File downloaded successfully, processing content...');
    const text = await fileData.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',');
    console.log('CSV Headers:', headers);
    
    // Process customers in smaller batches for better performance
    const batchSize = 50;
    const customers = [];
    const timestamp = Date.now();
    let successCount = 0;
    let errorCount = 0;
    
    console.log('Starting to process customer rows...');
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length === headers.length) {
        try {
          // Generate unique email and password
          const randomString = Math.random().toString(36).substring(7);
          const email = `customer${i}_${timestamp}_${randomString}@example.com`;
          const password = crypto.randomUUID();
          
          // Create auth user first
          console.log(`Creating auth user for: ${values[0]?.trim()}`);
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: values[0]?.trim()
            }
          });

          if (authError) {
            console.error(`Error creating auth user for row ${i}:`, authError);
            errorCount++;
            continue;
          }

          if (authUser?.user) {
            // Check if profile already exists
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', authUser.user.id)
              .single();

            if (existingProfile) {
              console.log(`Profile already exists for user ${authUser.user.id}, skipping...`);
              errorCount++;
              continue;
            }

            customers.push({
              id: authUser.user.id,
              full_name: values[0]?.trim(),
              phone_number: values[1]?.trim(),
              address: values[2]?.trim(),
              driver_license: values[3]?.trim(),
              role: 'customer'
            });
            successCount++;
            console.log(`Processed customer row ${i}: ${values[0]?.trim()} with ID: ${authUser.user.id}`);
          }
        } catch (error) {
          console.error(`Error processing row ${i}:`, error);
          errorCount++;
          continue;
        }
      }
      
      // Insert batch when it reaches batchSize or it's the last batch
      if (customers.length === batchSize || i === rows.length - 1) {
        if (customers.length > 0) {
          console.log(`Inserting batch of ${customers.length} customers...`);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(customers);

          if (insertError) {
            console.error('Error inserting customers:', insertError);
            errorCount += customers.length;
            successCount -= customers.length;
          }
          
          // Update import log with progress
          const { error: updateError } = await supabase
            .from('import_logs')
            .update({
              records_processed: successCount,
              errors: { failed: errorCount },
              status: i === rows.length - 1 ? 'completed' : 'processing'
            })
            .eq('file_name', fileName);

          if (updateError) {
            console.error('Error updating import log:', updateError);
          }
          
          console.log(`Successfully inserted batch, processed ${i} rows so far`);
        }
        // Clear the batch array
        customers.length = 0;
      }
    }

    console.log('Import process completed successfully');
    console.log(`Total successful imports: ${successCount}`);
    console.log(`Total failed imports: ${errorCount}`);
    
    return new Response(
      JSON.stringify({ 
        message: 'Import completed successfully',
        stats: {
          success: successCount,
          errors: errorCount
        }
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