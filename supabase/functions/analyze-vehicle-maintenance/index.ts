import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    // Get all vehicles with their sensor data
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select(`
        id,
        make,
        model,
        year,
        mileage,
        vehicle_sensor_data (*)
      `)
      .order('created_at', { ascending: false })

    if (vehiclesError) throw vehiclesError

    // Analyze each vehicle's data and make predictions
    for (const vehicle of vehicles) {
      const sensorData = vehicle.vehicle_sensor_data
      if (!sensorData?.length) continue

      const latestData = sensorData[0]
      const predictions = []

      // Analyze oil life
      if (latestData.oil_life_remaining < 30) {
        predictions.push({
          vehicle_id: vehicle.id,
          prediction_type: 'oil_change',
          predicted_date: new Date(Date.now() + (latestData.oil_life_remaining * 24 * 60 * 60 * 1000)),
          confidence_score: 0.9,
          predicted_issues: ['Low oil life'],
          recommended_services: ['Oil change', 'Oil filter replacement'],
          estimated_cost: 150,
          priority: latestData.oil_life_remaining < 15 ? 'high' : 'medium'
        })
      }

      // Analyze brake pad wear
      if (latestData.brake_pad_wear > 70) {
        predictions.push({
          vehicle_id: vehicle.id,
          prediction_type: 'brake_service',
          predicted_date: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
          confidence_score: 0.85,
          predicted_issues: ['Brake pad wear exceeding 70%'],
          recommended_services: ['Brake pad replacement', 'Brake system inspection'],
          estimated_cost: 300,
          priority: latestData.brake_pad_wear > 85 ? 'high' : 'medium'
        })
      }

      // Analyze battery health
      if (latestData.battery_health < 60) {
        predictions.push({
          vehicle_id: vehicle.id,
          prediction_type: 'battery_replacement',
          predicted_date: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
          confidence_score: 0.8,
          predicted_issues: ['Low battery health'],
          recommended_services: ['Battery replacement', 'Electrical system check'],
          estimated_cost: 200,
          priority: latestData.battery_health < 40 ? 'high' : 'medium'
        })
      }

      // Store predictions in the database
      if (predictions.length > 0) {
        const { error: predictionsError } = await supabase
          .from('maintenance_predictions')
          .insert(predictions)

        if (predictionsError) throw predictionsError
      }
    }

    return new Response(
      JSON.stringify({ message: 'Maintenance analysis completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})