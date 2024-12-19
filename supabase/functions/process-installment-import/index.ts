import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

console.log("Hello from Process Installment Import!")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath, contractName } = await req.json()

    if (!contractName) {
      throw new Error('Contract name is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(filePath)

    if (downloadError) throw downloadError

    // Parse CSV content
    const text = await fileData.text()
    const rows = text.split('\n')
    const headers = rows[0].split(',')

    // Process each row
    const processedRows = await Promise.all(
      rows.slice(1).filter(row => row.trim()).map(async (row) => {
        const values = row.split(',')
        const rowData = headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim() ?? '';
          return obj;
        }, {} as Record<string, string>);

        // Parse amount - remove 'QAR' and convert to number
        const amount = parseFloat(rowData['Amount'].replace('QAR', '').replace(/,/g, '').trim());
        
        // Parse date - convert from 'Month-YY' format to ISO date
        const [month, year] = rowData['Date'].split('-');
        const date = new Date(`20${year}`, getMonthNumber(month), 1);

        // Check for 'OK' status
        const status = rowData['Status']?.toLowerCase().includes('ok') ? 'completed' : 'pending';
        
        // Insert payment schedule with contract name and status
        const { error: insertError } = await supabaseClient
          .from('payment_schedules')
          .insert({
            amount: amount,
            due_date: date.toISOString(),
            status: status,
            contract_name: contractName,
            metadata: {
              cheque_number: rowData['N°cheque'],
              drawee_bank: rowData['Drawee Bank'],
              original_amount: rowData['Amount'],
              sold: rowData['sold'],
              original_status: rowData['Status']
            }
          });

        if (insertError) throw insertError;

        return rowData;
      })
    );

    // Delete the uploaded file
    await supabaseClient
      .storage
      .from('imports')
      .remove([filePath]);

    return new Response(
      JSON.stringify({
        message: 'Import completed successfully',
        processed: processedRows.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    )
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