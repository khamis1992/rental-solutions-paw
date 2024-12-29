import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName, fileContent } = await req.json()
    console.log('Processing file:', fileName)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse CSV content
    const lines = fileContent.split('\n')
    const headers = lines[0].split(',').map((h: string) => h.trim())
    
    // Validate headers
    const requiredHeaders = [
      'Lease_ID',
      'Customer_Name',
      'Amount',
      'License_Plate',
      'Vehicle',
      'Payment_Date',
      'Payment_Method',
      'Transaction_ID',
      'Description',
      'Type',
      'Status'
    ]

    console.log('Validating headers:', headers)

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      console.error('Missing headers:', missingHeaders)
      return new Response(
        JSON.stringify({ error: `Missing required headers: ${missingHeaders.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Process each line (skip header)
    const transactions = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(',').map((v: string) => v.trim())
      const transaction: Record<string, any> = {}
      
      headers.forEach((header: string, index: number) => {
        // Convert Amount to numeric
        if (header === 'Amount') {
          transaction[header] = parseFloat(values[index])
        } 
        // Keep Payment_Date as is
        else if (header === 'Payment_Date') {
          transaction[header] = values[index]
        }
        // Handle other fields
        else {
          transaction[header] = values[index]
        }
      })

      transactions.push({
        lease_id: transaction.Lease_ID,
        customer_name: transaction.Customer_Name,
        amount: transaction.Amount,
        license_plate: transaction.License_Plate,
        vehicle: transaction.Vehicle,
        payment_date: transaction.Payment_Date,
        payment_method: transaction.Payment_Method,
        transaction_id: transaction.Transaction_ID,
        description: transaction.Description,
        type: transaction.Type,
        status: transaction.Status || 'pending'
      })
    }

    console.log(`Processing ${transactions.length} transactions`)

    // Insert transactions in batches of 100
    const batchSize = 100
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize)
      const { error: insertError } = await supabase
        .from('transaction_imports')
        .insert(batch)

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Transactions imported successfully', 
        count: transactions.length 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 500 
      }
    )
  }
})
