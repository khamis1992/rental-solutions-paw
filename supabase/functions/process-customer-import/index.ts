import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting customer import process...');
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

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
    
    console.log('Starting to process customer rows...');
    for (let i = 1; i < rows.length; i++) {
      const values = rows[i].split(',');
      if (values.length === headers.length) {
        const randomString = Math.random().toString(36).substring(7);
        const email = `customer${i}_${timestamp}_${randomString}@example.com`;
        const password = crypto.randomUUID();
        
        try {
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
            console.error('Error creating auth user:', authError);
            // Skip this user and continue with the next one
            continue;
          }

          if (authUser?.user) {
            customers.push({
              id: authUser.user.id,
              full_name: values[0]?.trim(),
              phone_number: values[1]?.trim(),
              address: values[2]?.trim(),
              driver_license: values[3]?.trim(),
              role: 'customer'
            });
            console.log(`Processed customer row ${i}: ${values[0]?.trim()} with ID: ${authUser.user.id}`);
          }
        } catch (error) {
          console.error(`Error processing row ${i}:`, error);
          // Skip this user and continue with the next one
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
            throw insertError;
          }
          
          // Update import log with progress
          const { error: updateError } = await supabase
            .from('import_logs')
            .update({
              records_processed: i,
              status: i === rows.length - 1 ? 'completed' : 'processing'
            })
            .eq('file_name', fileName);

          if (updateError) {
            console.error('Error updating import log:', updateError);
            throw updateError;
          }
          
          console.log(`Successfully inserted batch, processed ${i} rows so far`);
        }
        // Clear the batch array
        customers.length = 0;
      }
    }

    console.log('Import process completed successfully');
    return new Response(
      JSON.stringify({ message: 'Import completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import process failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});