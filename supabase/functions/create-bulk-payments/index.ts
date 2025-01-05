import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkPaymentDetails {
  firstChequeNumber: string;
  totalCheques: number;
  amount: string;
  startDate: string;
  draweeBankName: string;
  contractId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Processing bulk payment request...')
    const details: BulkPaymentDetails = await req.json()
    console.log('Request details:', details)

    // Input validation
    if (!details.firstChequeNumber || !details.totalCheques || !details.amount || 
        !details.startDate || !details.draweeBankName || !details.contractId) {
      throw new Error('Missing required fields')
    }

    // Extract base number and prefix from cheque number
    const baseNumber = details.firstChequeNumber.replace(/\D/g, '')
    const prefix = details.firstChequeNumber.replace(/\d/g, '')

    if (!baseNumber) {
      throw new Error('Invalid cheque number format')
    }

    // Generate payment records
    const payments = Array.from({ length: details.totalCheques }, (_, index) => {
      const chequeNumber = `${prefix}${String(Number(baseNumber) + index).padStart(baseNumber.length, '0')}`
      const paymentDate = new Date(details.startDate)
      paymentDate.setMonth(paymentDate.getMonth() + index)

      return {
        contract_id: details.contractId,
        cheque_number: chequeNumber,
        amount: Number(details.amount),
        payment_date: paymentDate.toISOString(),
        drawee_bank: details.draweeBankName,
        paid_amount: 0,
        remaining_amount: Number(details.amount),
        status: 'pending'
      }
    })

    console.log('Generated payments:', payments)

    try {
      // Check for duplicate cheque numbers
      const { data: existingCheques, error: checkError } = await supabase
        .from('car_installment_payments')
        .select('cheque_number')
        .in('cheque_number', payments.map(p => p.cheque_number))

      if (checkError) {
        console.error('Error checking existing cheques:', checkError)
        throw new Error('Failed to check for existing cheque numbers')
      }

      if (existingCheques && existingCheques.length > 0) {
        const duplicates = existingCheques.map(c => c.cheque_number).join(', ')
        throw new Error(`Duplicate cheque numbers found: ${duplicates}`)
      }

      // Insert payments one by one to better handle errors
      for (const payment of payments) {
        const { error: insertError } = await supabase
          .from('car_installment_payments')
          .insert([payment])

        if (insertError) {
          console.error('Error inserting payment:', payment, insertError)
          throw new Error(`Failed to insert payment with cheque number ${payment.cheque_number}: ${insertError.message}`)
        }
      }

      console.log('Successfully created bulk payments')
      return new Response(
        JSON.stringify({ success: true, count: payments.length }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (error) {
      console.error('Error in database operations:', error)
      throw error
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})