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

    let response;

    // Handle revenue-related queries
    if (query.toLowerCase().includes('revenue')) {
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
    else if (query.toLowerCase().includes('maintenance')) {
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
    // Default response for unhandled queries
    else {
      response = {
        type: 'unknown_query',
        error: 'Could not understand the query. Please try being more specific.'
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