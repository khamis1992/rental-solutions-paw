import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const processCSVContent = (content: string) => {
  const lines = content.split('\n').filter(line => line.trim());
  const processedRows = [];
  let currentRow = '';
  let insideQuotes = false;

  for (let i = 1; i < lines.length; i++) { // Skip header row
    const line = lines[i].trim();
    
    for (let char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      }
      currentRow += char;
    }

    if (!insideQuotes) {
      if (currentRow) {
        // Process the complete row
        const values = currentRow.split(',').map(val => {
          // Clean up quotes and trim
          return val.replace(/^"|"$/g, '').trim();
        });

        // Only process rows that have all required fields
        if (values.length >= 8) {
          try {
            const [
              serial_number,
              violation_number,
              violation_date,
              license_plate,
              fine_location,
              violation_charge,
              fine_amount,
              violation_points
            ] = values;

            // Parse date (assuming DD/MM/YYYY format)
            const [day, month, year] = violation_date.split('/');
            const parsedDate = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            );

            // Create fine object
            const fine = {
              serial_number,
              violation_number,
              violation_date: parsedDate.toISOString(),
              license_plate,
              fine_location: fine_location.replace(/^"|"$/g, ''),
              fine_type: violation_charge.replace(/^"|"$/g, ''),
              fine_amount: parseFloat(fine_amount),
              violation_points: parseInt(violation_points),
              payment_status: 'pending',
              assignment_status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            processedRows.push(fine);
          } catch (error) {
            console.error('Error processing row:', currentRow, error);
          }
        }
      }
      currentRow = '';
    } else {
      // Add a space for line breaks within quotes
      currentRow += ' ';
    }
  }

  return processedRows;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download file content
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const content = await fileData.text();
    console.log('File content loaded');

    // Process CSV content
    const processedRows = processCSVContent(content);
    console.log(`Processed ${processedRows.length} valid rows`);

    // Insert data in batches
    const batchSize = 50;
    const results = [];
    const errors = [];

    for (let i = 0; i < processedRows.length; i += batchSize) {
      const batch = processedRows.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('traffic_fines')
        .insert(batch)
        .select();

      if (error) {
        console.error('Batch insert error:', error);
        errors.push({
          batch: i / batchSize + 1,
          error: error.message,
          details: error.details
        });
      } else {
        results.push(...(data || []));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});