import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get vehicle stats
    const { data: vehicleStats, error: vehicleError } = await supabaseClient
      .from('vehicles')
      .select('status')

    if (vehicleError) throw vehicleError

    const totalVehicles = vehicleStats.length
    const availableVehicles = vehicleStats.filter(v => v.status === 'available').length
    const rentedVehicles = vehicleStats.filter(v => v.status === 'rented').length
    const maintenanceVehicles = vehicleStats.filter(v => v.status === 'maintenance').length

    // Get customer stats
    const { count: totalCustomers, error: customerError } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    if (customerError) throw customerError

    // Get active rentals
    const { count: activeRentals, error: rentalError } = await supabaseClient
      .from('leases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (rentalError) throw rentalError

    // Get monthly revenue
    const { data: revenueData, error: revenueError } = await supabaseClient
      .from('unified_payments')
      .select('amount_paid')
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('payment_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString())

    if (revenueError) throw revenueError

    const monthlyRevenue = revenueData.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0)

    return new Response(
      JSON.stringify({
        total_vehicles: totalVehicles,
        available_vehicles: availableVehicles,
        rented_vehicles: rentedVehicles,
        maintenance_vehicles: maintenanceVehicles,
        total_customers: totalCustomers,
        active_rentals: activeRentals,
        monthly_revenue: monthlyRevenue
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})