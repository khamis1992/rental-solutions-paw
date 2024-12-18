import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

console.log("Loading agreement import function...");

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Remove any potential whitespace
    dateStr = dateStr.trim();
    
    // Try to parse DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};

const normalizeStatus = (status: string): string => {
  if (!status) return 'pending';
  
  const statusMap: Record<string, string> = {
    'open': 'open',
    'active': 'active',
    'closed': 'closed',
    'cancelled': 'cancelled',
    'pending': 'pending',
    'pending_payment': 'pending'
  };

  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || 'pending';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    console.log('Starting agreement import process...');
    
    // Get and validate the request body
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const { fileName } = requestData;
    if (!fileName) {
      throw new Error('fileName is required');
    }

    console.log('Processing file:', fileName);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const batchSize = 50;
    const agreements = [];

    // Get first available vehicle for testing
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
        
        // Extract data from CSV
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
            const { data: newCustomer, error: customerError } = await supabase
              .from('profiles')
              .insert({
                full_name: fullName || `Unknown Customer ${Date.now()}`,
                role: 'customer'
              })
              .select()
              .single();

            if (customerError) throw customerError;
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
          
          // Clear the batch array
          agreements.length = 0;
        }
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          row: i,
          error: error.message,
          data: rows[i]
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