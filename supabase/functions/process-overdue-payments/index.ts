import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all active leases with their payment schedules
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select(`
        id,
        customer_id,
        total_amount,
        payments (
          amount,
          payment_date,
          status
        )
      `)
      .eq('status', 'active')

    if (leaseError) throw leaseError

    // Process each lease
    for (const lease of leases || []) {
      const totalPaid = lease.payments
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      const balance = lease.total_amount - totalPaid
      
      // Get the last payment date
      const lastPayment = lease.payments
        ?.filter(p => p.status === 'completed')
        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]

      const lastPaymentDate = lastPayment?.payment_date

      // Calculate days overdue
      const daysOverdue = lastPaymentDate 
        ? Math.max(0, Math.floor((new Date().getTime() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24)))
        : 0

      if (balance > 0) {
        // Update or insert overdue payment record
        const { error: upsertError } = await supabase
          .from('overdue_payments')
          .upsert({
            agreement_id: lease.id,
            customer_id: lease.customer_id,
            total_amount: lease.total_amount,
            amount_paid: totalPaid,
            balance: balance,
            last_payment_date: lastPaymentDate,
            days_overdue: daysOverdue,
            status: balance === lease.total_amount ? 'pending' : 'partially_paid'
          }, {
            onConflict: 'agreement_id'
          })

        if (upsertError) throw upsertError
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing overdue payments:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})