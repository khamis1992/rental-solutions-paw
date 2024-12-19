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
    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    const text = await file.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',').map(h => h.trim());
    
    // Skip header row
    const dataRows = rows.slice(1);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let processedCount = 0;
    const errors = [];

    for (const row of dataRows) {
      try {
        const values = row.split(',').map(v => v.trim());
        const rowData = headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as Record<string, string>);

        // Parse amount - remove 'QAR' and convert to number
        const amount = parseFloat(rowData['Amount'].replace('QAR', '').replace(/,/g, '').trim());
        
        // Parse date - convert from 'Month-YY' format to ISO date
        const [month, year] = rowData['Date'].split('-');
        const date = new Date(`20${year}`, getMonthNumber(month), 1);
        
        // Insert payment schedule
        const { error: insertError } = await supabase
          .from('payment_schedules')
          .insert({
            amount: amount,
            due_date: date.toISOString(),
            status: 'pending',
            metadata: {
              cheque_number: rowData['N°cheque'],
              drawee_bank: rowData['Drawee Bank'],
              original_amount: rowData['Amount'],
              sold: rowData['sold']
            }
          });

        if (insertError) throw insertError;
        processedCount++;
      } catch (error) {
        console.error('Error processing row:', row, error);
        errors.push({ row, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errors.length > 0 ? errors : null,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Import process error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function getMonthNumber(month: string): number {
  const months: Record<string, number> = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };
  return months[month] || 0;
}