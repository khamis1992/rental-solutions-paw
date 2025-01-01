import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting CSV analysis with Deepseek AI...')
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    const csvContent = await file.text()
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())

    // Define expected format
    const requiredFields = [
      'Amount',
      'Payment_Date',
      'Payment_Method',
      'Status',
      'Description',
      'Transaction_ID',
      'Lease_ID'
    ]

    // Prepare data for AI analysis
    const prompt = `
    Analyze and fix this CSV data for financial transactions. Required fields are: ${requiredFields.join(', ')}.
    The data format should be:
    - Amount: numeric value
    - Payment_Date: DD-MM-YYYY format
    - Payment_Method: one of [cash, credit_card, bank_transfer, cheque]
    - Status: one of [pending, completed, failed]
    - Description: text
    - Transaction_ID: alphanumeric
    - Lease_ID: UUID format

    Here's the CSV data (first few rows):
    ${lines.slice(0, 5).join('\n')}

    Please analyze and suggest fixes for any formatting issues.
    `

    // Call Deepseek API
    const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a data validation assistant specializing in financial transaction data.' },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`Deepseek API error: ${await aiResponse.text()}`)
    }

    const aiResult = await aiResponse.json()
    const analysis = aiResult.choices[0].message.content

    // Process the data and apply AI suggestions
    const processedLines = lines.map((line, index) => {
      if (index === 0) return line // Keep header row unchanged
      
      const values = line.split(',').map(v => v.trim())
      const rowData: Record<string, string> = {}
      
      headers.forEach((header, i) => {
        rowData[header] = values[i] || ''
      })

      // Apply fixes based on AI suggestions
      if (rowData.Payment_Date) {
        // Ensure date format is DD-MM-YYYY
        const dateMatch = rowData.Payment_Date.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
        if (dateMatch) {
          rowData.Payment_Date = `${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3]}`
        }
      }

      if (rowData.Amount) {
        // Clean up amount format
        rowData.Amount = rowData.Amount.replace(/[^0-9.-]/g, '')
      }

      return Object.values(rowData).join(',')
    })

    const processedContent = processedLines.join('\n')

    // Store the processed file
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `processed_${Date.now()}_${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('imports')
      .upload(fileName, processedContent, {
        contentType: 'text/csv',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Return analysis results and processed file info
    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        analysis,
        aiSuggestions: aiResult.choices[0].message.content,
        processedFileUrl: uploadData.path,
        totalRows: lines.length - 1,
        validRows: processedLines.length - 1,
        invalidRows: lines.length - processedLines.length,
        totalAmount: processedLines.slice(1).reduce((sum, line) => {
          const amount = parseFloat(line.split(',')[headers.indexOf('Amount')] || '0')
          return sum + (isNaN(amount) ? 0 : amount)
        }, 0),
        issues: analysis.match(/Row \d+:.+/g) || [],
        suggestions: [
          'Please review and correct the errors before proceeding',
          'Ensure all amounts are valid numbers',
          'Verify date formats are correct'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing file:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})