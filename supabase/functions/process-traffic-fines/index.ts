import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from 'https://deno.land/std@0.168.0/encoding/csv.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { fileName } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(`traffic-fines/${fileName}`)

    if (downloadError) throw downloadError

    // Parse CSV content
    const text = await fileData.text()
    const rows = parse(text, { skipFirstRow: true })

    // Create import log
    const { data: importLog, error: importLogError } = await supabase
      .from('traffic_fine_imports')
      .insert({
        file_name: fileName,
        total_fines: rows.length,
      })
      .select()
      .single()

    if (importLogError) throw importLogError

    let assignedCount = 0
    let unassignedCount = 0
    const errors = []

    // Process each row
    for (const row of rows) {
      try {
        const [serial, violationNo, violationDate, plateNumber, location, charge, fine, points] = row

        // Find matching agreement
        const { data: agreements, error: agreementError } = await supabase
          .from('leases')
          .select('id, vehicle_id')
          .eq('vehicles.license_plate', plateNumber)
          .lte('start_date', violationDate)
          .gte('end_date', violationDate)
          .single()

        if (agreementError) {
          unassignedCount++
          errors.push({
            violationNo,
            plateNumber,
            error: 'No matching agreement found'
          })
          continue
        }

        // Create traffic fine record
        const { error: fineError } = await supabase
          .from('traffic_fines')
          .insert({
            serial_number: serial,
            violation_number: violationNo,
            fine_date: violationDate,
            fine_location: location,
            fine_type: charge,
            fine_amount: parseFloat(fine),
            violation_points: parseInt(points) || 0,
            lease_id: agreements.id,
            vehicle_id: agreements.vehicle_id,
            assignment_status: 'assigned',
            import_batch_id: importLog.id
          })

        if (fineError) throw fineError
        assignedCount++
      } catch (error) {
        console.error('Error processing row:', error)
        unassignedCount++
        errors.push(error)
      }
    }

    // Update import log with results
    await supabase
      .from('traffic_fine_imports')
      .update({
        assigned_fines: assignedCount,
        unassigned_fines: unassignedCount,
        import_errors: errors
      })
      .eq('id', importLog.id)

    return new Response(
      JSON.stringify({
        success: true,
        totalFines: rows.length,
        assignedFines: assignedCount,
        unassignedFines: unassignedCount,
        errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})