import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { includesDiskMetrics } = await req.json();
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Analyze vehicle performance
    const { data: vehicleData } = await supabaseClient
      .from('vehicles')
      .select(`
        *,
        maintenance (
          cost,
          service_type,
          completed_date
        )
      `);

    // Generate insights
    const insights = generateInsights(vehicleData);
    
    // Store insights in the database
    await supabaseClient
      .from('ai_analytics_insights')
      .insert(insights.map(insight => ({
        category: insight.category,
        insight: insight.description,
        data_points: insight.data,
        confidence_score: insight.confidence,
        priority: insight.priority
      })));

    // Detect anomalies
    const anomalies = detectAnomalies(vehicleData);
    
    // Store anomalies in the database
    await supabaseClient
      .from('operational_anomalies')
      .insert(anomalies.map(anomaly => ({
        detection_type: anomaly.type,
        severity: anomaly.severity,
        description: anomaly.description,
        affected_records: anomaly.data
      })));

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateInsights(data: any[]) {
  const insights = [];
  
  // Maintenance cost analysis
  const maintenanceCosts = data.reduce((acc, vehicle) => {
    const costs = vehicle.maintenance?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0;
    return acc + costs;
  }, 0);

  if (maintenanceCosts > 0) {
    insights.push({
      category: 'maintenance',
      description: `Total maintenance costs are ${maintenanceCosts}. Consider optimizing maintenance schedules.`,
      data: { total_costs: maintenanceCosts },
      confidence: 0.85,
      priority: maintenanceCosts > 10000 ? 1 : 2
    });
  }

  // Vehicle utilization patterns
  const utilizationRates = data.map(vehicle => ({
    id: vehicle.id,
    status: vehicle.status,
    daysInStatus: getDaysInStatus(vehicle.updated_at)
  }));

  const underutilizedVehicles = utilizationRates.filter(v => 
    v.status === 'available' && v.daysInStatus > 7
  );

  if (underutilizedVehicles.length > 0) {
    insights.push({
      category: 'utilization',
      description: `${underutilizedVehicles.length} vehicles have been unused for over a week. Consider adjusting pricing or marketing strategies.`,
      data: { vehicles: underutilizedVehicles },
      confidence: 0.9,
      priority: 1
    });
  }

  return insights;
}

function detectAnomalies(data: any[]) {
  const anomalies = [];
  
  // Detect maintenance cost anomalies
  data.forEach(vehicle => {
    const maintenanceCosts = vehicle.maintenance || [];
    const averageCost = maintenanceCosts.reduce((sum, m) => sum + (m.cost || 0), 0) / 
                       (maintenanceCosts.length || 1);

    const highCostMaintenance = maintenanceCosts.filter(m => m.cost > averageCost * 2);
    
    if (highCostMaintenance.length > 0) {
      anomalies.push({
        type: 'maintenance_cost',
        severity: 'high',
        description: `Unusually high maintenance costs detected for vehicle ${vehicle.license_plate}`,
        data: { vehicle_id: vehicle.id, costs: highCostMaintenance }
      });
    }
  });

  return anomalies;
}

function getDaysInStatus(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}