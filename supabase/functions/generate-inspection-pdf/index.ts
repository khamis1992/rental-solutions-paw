import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { createBasicPDF, drawText, drawVehicleInfo, drawInspectionDetails, drawMaintenanceDetails } from './pdfUtils.ts'
import { uploadPDFToStorage, saveDocumentReference } from './storageUtils.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
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
    const { pdfDoc, page, font } = await createBasicPDF()
    const { height } = page.getSize()
    
    // Add content to PDF
    let yPosition = height - 50

    // Title
    drawText(page, 'Vehicle Inspection Report', 50, yPosition, 20, font)
    yPosition -= 40

    // Vehicle Information
    drawText(page, 'Vehicle Information', 50, yPosition, 16, font)
    yPosition -= 25
    
    yPosition = drawVehicleInfo(page, font, maintenance.vehicle, yPosition)
    yPosition = drawInspectionDetails(page, font, maintenance.inspection?.[0], yPosition)
    yPosition = drawMaintenanceDetails(page, font, maintenance, yPosition)

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save()

    // Save PDF to storage
    const fileName = `inspection_${maintenanceId}_${Date.now()}.pdf`
    const publicUrl = await uploadPDFToStorage(pdfBytes, fileName, supabase)

    // Save document reference
    await saveDocumentReference(supabase, vehicleId, fileName, 'Inspection Report')

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