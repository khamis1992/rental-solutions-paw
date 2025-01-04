import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { payment, contract }, error } = await req.json()
    
    if (error) {
      throw error
    }

    // Update contract amounts
    const { error: updateError } = await supabaseClient
      .from('car_installment_contracts')
      .update({
        amount_paid: payment.paid_amount,
        amount_pending: contract.total_contract_value - payment.paid_amount,
        remaining_installments: contract.total_installments - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', contract.id)

    if (updateError) {
      throw updateError
    }

    // Create expense transaction
    const { error: expenseError } = await supabaseClient
      .from('accounting_transactions')
      .insert({
        type: 'EXPENSE',
        amount: payment.paid_amount,
        description: `Car Installment Payment - ${contract.car_type} - Cheque #${payment.cheque_number}`,
        transaction_date: payment.payment_date,
        category_id: payment.category_id, // Assuming you have a category for vehicle expenses
        status: 'completed'
      })

    if (expenseError) {
      throw expenseError
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})