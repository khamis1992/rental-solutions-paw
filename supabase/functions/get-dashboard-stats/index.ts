import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get total vehicles
    const { count: totalVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    // Get available vehicles
    const { count: availableVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    // Get rented vehicles
    const { count: rentedVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rented');

    // Get maintenance vehicles
    const { count: maintenanceVehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'maintenance');

    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Get active rentals
    const { count: activeRentals } = await supabase
      .from('leases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get monthly revenue
    const { data: revenueData } = await supabase
      .from('unified_payments')
      .select('amount')
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .eq('status', 'completed');

    const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

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
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in get-dashboard-stats:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});