import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface InstallmentRow {
  'N°cheque': string;
  'Amount': string;
  'Date': string;
  'Drawee Bank': string;
  'sold': string;
}

const convertExcelDate = (serialDate: number): Date => {
  return new Date((serialDate - 25569) * 86400 * 1000);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting installment import process...');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )

    // Get request data
    const { fileName, contractName } = await req.json()
    console.log('Processing file:', fileName, 'for contract:', contractName);

    if (!fileName || !contractName) {
      throw new Error('fileName and contractName are required')
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw downloadError
    }

    const text = await fileData.text()
    console.log('File content:', text.substring(0, 200) + '...'); // Log first 200 chars

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const headers = lines[0].split(',').map(h => h.trim())
    console.log('Headers:', headers);

    // Validate required headers
    const requiredHeaders = ['N°cheque', 'Amount', 'Date', 'Drawee Bank']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`)
    }

    const errors = []
    const processedRows = []

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(',').map(v => v.trim())
      console.log(`Processing row ${i}:`, values);

      const row = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index]
        return obj
      }, {}) as InstallmentRow

      try {
        // Parse amount - handle the format "QAR XX,XXX.XXX" or just numbers
        const amountStr = row['Amount'].replace(/['"]/g, '').trim()
        console.log('Processing amount:', amountStr);
        
        // Remove QAR and any commas, then parse
        const cleanAmount = amountStr.replace(/QAR/i, '').replace(/,/g, '').trim()
        const amount = parseFloat(cleanAmount)
        
        if (isNaN(amount)) {
          throw new Error(`Invalid amount format in row ${i}: ${amountStr}`)
        }

        // Parse date - handle Excel serial dates or regular date formats
        const dateStr = row['Date'].replace(/['"]/g, '').trim()
        console.log('Processing date:', dateStr);
        
        let date: Date;
        const numDate = parseFloat(dateStr);
        
        if (!isNaN(numDate)) {
          // Handle Excel serial date
          date = convertExcelDate(numDate);
        } else if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else if (dateStr.includes('-')) {
          const [day, month, year] = dateStr.split('-')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
          throw new Error(`Invalid date format in row ${i}: ${dateStr}`)
        }

        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date in row ${i}: ${dateStr}`)
        }

        processedRows.push({
          contract_name: contractName,
          amount: amount,
          due_date: date.toISOString(),
          status: 'pending',
          metadata: {
            cheque_number: row['N°cheque'],
            drawee_bank: row['Drawee Bank'],
            sold: row['sold'] || null
          }
        })
      } catch (error) {
        console.error(`Error processing row ${i}:`, error)
        errors.push({
          row: i,
          error: error.message,
          data: row
        })
      }
    }

    console.log(`Processed ${processedRows.length} rows with ${errors.length} errors`);

    // Insert valid rows
    if (processedRows.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('payment_schedules')
        .insert(processedRows)

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }

    // Update import log
    await supabaseClient
      .from('import_logs')
      .insert({
        file_name: fileName,
        import_type: 'installment',
        status: errors.length === 0 ? 'completed' : 'completed_with_errors',
        records_processed: processedRows.length,
        errors: errors.length > 0 ? errors : null
      })

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedRows.length,
        errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})