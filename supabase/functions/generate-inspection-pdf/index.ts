import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { PDFDocument, rgb, StandardFonts } from 'https://cdn.skypack.dev/pdf-lib'

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

    // Create PDF document
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { height, width } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12

    // Add content to PDF
    let yPosition = height - 50

    // Title
    page.drawText('Vehicle Inspection Report', {
      x: 50,
      y: yPosition,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 40

    // Vehicle Information
    page.drawText('Vehicle Information', {
      x: 50,
      y: yPosition,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    const vehicleInfo = [
      `Make: ${maintenance.vehicle.make}`,
      `Model: ${maintenance.vehicle.model}`,
      `Year: ${maintenance.vehicle.year}`,
      `License Plate: ${maintenance.vehicle.license_plate}`,
    ]

    for (const info of vehicleInfo) {
      page.drawText(info, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20
    }
    yPosition -= 20

    // Inspection Details
    if (maintenance.inspection && maintenance.inspection.length > 0) {
      const inspection = maintenance.inspection[0]
      
      page.drawText('Inspection Details', {
        x: 50,
        y: yPosition,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 25

      const inspectionInfo = [
        `Date: ${new Date(inspection.inspection_date).toLocaleDateString()}`,
        `Odometer Reading: ${inspection.odometer_reading} km`,
        `Fuel Level: ${inspection.fuel_level}%`,
      ]

      for (const info of inspectionInfo) {
        page.drawText(info, {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= 20
      }

      if (inspection.damage_markers) {
        yPosition -= 20
        page.drawText('Damage Report', {
          x: 50,
          y: yPosition,
          size: 14,
          font,
          color: rgb(0, 0, 0),
        })
        yPosition -= 20

        inspection.damage_markers.forEach((marker: any) => {
          page.drawText(`- ${marker.description} (${marker.view} view)`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          })
          yPosition -= 20
        })
      }
    }

    // Maintenance Details
    yPosition -= 20
    page.drawText('Maintenance Details', {
      x: 50,
      y: yPosition,
      size: 16,
      font,
      color: rgb(0, 0, 0),
    })
    yPosition -= 25

    const maintenanceInfo = [
      `Service Type: ${maintenance.service_type}`,
      `Description: ${maintenance.description}`,
      `Status: ${maintenance.status}`,
      `Scheduled Date: ${new Date(maintenance.scheduled_date).toLocaleDateString()}`,
    ]

    for (const info of maintenanceInfo) {
      page.drawText(info, {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

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
    console.error('Error generating PDF:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})