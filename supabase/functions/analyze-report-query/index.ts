import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log("Analyzing query:", query);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract key information from the query
    const timeframeMatch = query.match(/last (\d+) (day|week|month|year)s?/i);
    const timeframe = timeframeMatch ? {
      value: parseInt(timeframeMatch[1]),
      unit: timeframeMatch[2].toLowerCase()
    } : null;

    // Extract metrics and dimensions
    const metricKeywords = {
      revenue: ['revenue', 'income', 'earnings', 'money'],
      maintenance: ['maintenance', 'repairs', 'service'],
      utilization: ['utilization', 'usage', 'occupancy'],
      customers: ['customers', 'clients', 'renters'],
      vehicles: ['vehicles', 'cars', 'fleet'],
      expenses: ['expenses', 'costs', 'spending'],
      performance: ['performance', 'efficiency', 'metrics']
    };

    let response;

    // Handle revenue-related queries
    if (metricKeywords.revenue.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: revenueData, error: revenueError } = await supabase
        .from('unified_payments')
        .select('amount, payment_date, type')
        .eq('type', 'Income')
        .order('payment_date', { ascending: true });

      if (revenueError) throw revenueError;

      response = {
        type: 'revenue_analysis',
        data: revenueData,
        summary: `Showing revenue data${timeframe ? ` for the last ${timeframe.value} ${timeframe.unit}(s)` : ''}`
      };
    }
    // Handle maintenance-related queries
    else if (metricKeywords.maintenance.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_predictions')
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .order('predicted_date', { ascending: true });

      if (maintenanceError) throw maintenanceError;

      response = {
        type: 'maintenance_analysis',
        data: maintenanceData,
        summary: 'Showing upcoming maintenance predictions for vehicles'
      };
    }
    // Handle utilization-related queries
    else if (metricKeywords.utilization.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: utilizationData, error: utilizationError } = await supabase
        .from('vehicle_utilization_metrics')
        .select('*')
        .order('timestamp', { ascending: false });

      if (utilizationError) throw utilizationError;

      response = {
        type: 'utilization_analysis',
        data: utilizationData,
        summary: 'Showing vehicle utilization metrics'
      };
    }
    // Handle customer-related queries
    else if (metricKeywords.customers.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: customerData, error: customerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (customerError) throw customerError;

      response = {
        type: 'customer_analysis',
        data: customerData,
        summary: 'Showing customer analytics and trends'
      };
    }
    // Handle expense-related queries
    else if (metricKeywords.expenses.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: expenseData, error: expenseError } = await supabase
        .from('accounting_transactions')
        .select('*')
        .eq('type', 'EXPENSE')
        .order('transaction_date', { ascending: false });

      if (expenseError) throw expenseError;

      response = {
        type: 'expense_analysis',
        data: expenseData,
        summary: 'Showing expense breakdown and analysis'
      };
    }
    // Handle performance-related queries
    else if (metricKeywords.performance.some(keyword => query.toLowerCase().includes(keyword))) {
      const { data: performanceData, error: performanceError } = await supabase
        .from('performance_benchmarks')
        .select('*')
        .order('created_at', { ascending: false });

      if (performanceError) throw performanceError;

      response = {
        type: 'performance_analysis',
        data: performanceData,
        summary: 'Showing performance metrics and benchmarks'
      };
    }
    // Default response for unhandled queries
    else {
      response = {
        type: 'unknown_query',
        error: 'Could not understand the query. Please try being more specific about what metrics you want to analyze (revenue, maintenance, utilization, customers, expenses, or performance).'
      };
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing query:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});