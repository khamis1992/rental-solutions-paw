import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as pdf from 'https://deno.land/x/pdfkit@v0.3.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { maintenanceId, vehicleId } = await req.json()

    if (!maintenanceId || !vehicleId) {
      throw new Error('Missing required parameters')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch inspection and maintenance data
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('maintenance')
      .select(`
        *,
        vehicle:vehicles(*),
        inspection:vehicle_inspections(*)
      `)
      .eq('id', maintenanceId)
      .single()

    if (maintenanceError) throw maintenanceError

    // Generate PDF
    const doc = new pdf.default()
    const chunks: Uint8Array[] = []

    doc.on('data', (chunk: Uint8Array) => chunks.push(chunk))

    // Add content to PDF
    doc.fontSize(20).text('Vehicle Inspection Report', { align: 'center' })
    doc.moveDown()
    
    // Vehicle Information
    doc.fontSize(16).text('Vehicle Information')
    doc.fontSize(12)
      .text(`Make: ${maintenance.vehicle.make}`)
      .text(`Model: ${maintenance.vehicle.model}`)
      .text(`Year: ${maintenance.vehicle.year}`)
      .text(`License Plate: ${maintenance.vehicle.license_plate}`)
    doc.moveDown()

    // Inspection Details
    if (maintenance.inspection && maintenance.inspection.length > 0) {
      const inspection = maintenance.inspection[0]
      doc.fontSize(16).text('Inspection Details')
      doc.fontSize(12)
        .text(`Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`)
        .text(`Odometer Reading: ${inspection.odometer_reading} km`)
        .text(`Fuel Level: ${inspection.fuel_level}%`)
      
      if (inspection.damage_markers) {
        doc.moveDown()
        doc.fontSize(14).text('Damage Report')
        inspection.damage_markers.forEach((marker: any) => {
          doc.fontSize(12).text(`- ${marker.description} (${marker.view} view)`)
        })
      }
    }

    doc.moveDown()
    
    // Maintenance Details
    doc.fontSize(16).text('Maintenance Details')
    doc.fontSize(12)
      .text(`Service Type: ${maintenance.service_type}`)
      .text(`Description: ${maintenance.description}`)
      .text(`Status: ${maintenance.status}`)
      .text(`Scheduled Date: ${new Date(maintenance.scheduled_date).toLocaleDateString()}`)

    // Finalize PDF
    doc.end()

    // Combine chunks into a single Uint8Array
    const pdfBytes = new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []))

    // Save PDF to storage
    const fileName = `inspection_${maintenanceId}_${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('maintenance_documents')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('maintenance_documents')
      .getPublicUrl(fileName)

    // Save document reference
    const { error: docError } = await supabase
      .from('vehicle_documents')
      .insert({
        vehicle_id: vehicleId,
        document_type: 'application/pdf',
        document_url: fileName,
        document_name: 'Inspection Report'
      })

    if (docError) throw docError

    return new Response(
      JSON.stringify({ success: true, url: publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})