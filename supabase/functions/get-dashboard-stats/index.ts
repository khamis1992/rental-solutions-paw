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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get total vehicles and their statuses
    const { data: vehicles } = await supabaseClient
      .from('vehicles')
      .select('status');

    const totalVehicles = vehicles?.length || 0;
    const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;
    const rentedVehicles = vehicles?.filter(v => v.status === 'rented').length || 0;
    const maintenanceVehicles = vehicles?.filter(v => v.status === 'maintenance').length || 0;

    // Get total customers
    const { count: totalCustomers } = await supabaseClient
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    // Get active rentals
    const { count: activeRentals } = await supabaseClient
      .from('leases')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get monthly revenue
    const { data: payments } = await supabaseClient
      .from('unified_payments')
      .select('amount_paid')
      .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      .lt('payment_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString());

    const monthlyRevenue = payments?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0;

    const stats = {
      totalVehicles,
      availableVehicles,
      rentedVehicles,
      maintenanceVehicles,
      totalCustomers: totalCustomers || 0,
      activeRentals: activeRentals || 0,
      monthlyRevenue
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});