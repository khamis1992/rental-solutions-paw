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

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
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
        transaction[header] = values[index]
      })

      transactions.push({
        lease_id: transaction.Lease_ID,
        customer_name: transaction.Customer_Name,
        amount: parseFloat(transaction.Amount),
        license_plate: transaction.License_Plate,
        vehicle: transaction.Vehicle,
        payment_date: transaction.Payment_Date, // Use the date directly from CSV
        payment_method: transaction.Payment_Method,
        transaction_id: transaction.Transaction_ID,
        description: transaction.Description,
        type: transaction.Type,
        status: transaction.Status
      })
    }

    // Insert transactions
    const { error: insertError } = await supabase
      .from('transaction_imports')
      .insert(transactions)

    if (insertError) {
      console.error('Insert error:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ message: 'Transactions imported successfully', count: transactions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing import:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})