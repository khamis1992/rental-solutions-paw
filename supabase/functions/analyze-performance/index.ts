import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRole)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting performance analysis...')

    // Analyze vehicle utilization
    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('id, status, leases(id)')

    const utilization = vehicles?.reduce((acc: any, vehicle) => {
      acc.total++;
      if (vehicle.leases && vehicle.leases.length > 0) acc.active++;
      return acc;
    }, { total: 0, active: 0 })

    const utilizationRate = (utilization.active / utilization.total) * 100

    // Analyze payment patterns
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    const latePayments = payments?.filter(payment => 
      payment.status === 'completed' && 
      new Date(payment.payment_date) > new Date(payment.created_at)
    ).length || 0

    const latePaymentRate = (latePayments / (payments?.length || 1)) * 100

    // Generate insights based on analysis
    if (utilizationRate < 70) {
      await supabase.from('analytics_insights').insert({
        category: 'Fleet Utilization',
        insight: `Fleet utilization is at ${utilizationRate.toFixed(1)}%, which is below optimal levels.`,
        priority: utilizationRate < 50 ? 1 : 2,
        confidence_score: 0.85,
        data_points: { utilizationRate, totalVehicles: utilization.total }
      })
    }

    if (latePaymentRate > 15) {
      await supabase.from('analytics_insights').insert({
        category: 'Payment Patterns',
        insight: `High rate of late payments detected (${latePaymentRate.toFixed(1)}%). Consider reviewing payment policies.`,
        priority: latePaymentRate > 25 ? 1 : 2,
        confidence_score: 0.9,
        data_points: { latePaymentRate, analyzedPayments: payments?.length }
      })
    }

    // Check for anomalies
    if (latePaymentRate > 30) {
      await supabase.from('operational_anomalies').insert({
        detection_type: 'Payment Pattern',
        severity: 'high',
        description: `Unusually high rate of late payments detected (${latePaymentRate.toFixed(1)}%)`,
        affected_records: { 
          total_payments: payments?.length,
          late_payments: latePayments
        }
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Analysis completed successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in performance analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})