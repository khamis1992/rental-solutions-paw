
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
    console.log('Starting get-dashboard-stats function');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get total vehicles
    const { count: totalVehicles, error: totalError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    if (totalError) throw totalError;

    // Get available vehicles
    const { count: availableVehicles, error: availableError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'available');

    if (availableError) throw availableError;

    // Get rented vehicles
    const { count: rentedVehicles, error: rentedError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rented');

    if (rentedError) throw rentedError;

    // Get maintenance vehicles
    const { count: maintenanceVehicles, error: maintenanceError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'maintenance');

    if (maintenanceError) throw maintenanceError;

    // Get total customers
    const { count: totalCustomers, error: customersError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    if (customersError) throw customersError;

    // Get active rentals
    const { count: activeRentals, error: rentalsError } = await supabase
      .from('leases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (rentalsError) throw rentalsError;

    // Get monthly revenue
    const { data: revenueData, error: revenueError } = await supabase
      .from('unified_payments')
      .select('amount')
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .eq('status', 'completed');

    if (revenueError) throw revenueError;

    const monthlyRevenue = revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

    console.log('Successfully retrieved dashboard stats');

    return new Response(
      JSON.stringify({
        total_vehicles: totalVehicles || 0,
        available_vehicles: availableVehicles || 0,
        rented_vehicles: rentedVehicles || 0,
        maintenance_vehicles: maintenanceVehicles || 0,
        total_customers: totalCustomers || 0,
        active_rentals: activeRentals || 0,
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
