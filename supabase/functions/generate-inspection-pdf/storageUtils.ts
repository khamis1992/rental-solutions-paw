import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export const uploadPDFToStorage = async (
  pdfBytes: Uint8Array,
  fileName: string,
  supabase: any
) => {
  const { error: uploadError } = await supabase.storage
    .from('maintenance_documents')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('maintenance_documents')
    .getPublicUrl(fileName)

  return publicUrl
}

export const saveDocumentReference = async (
  supabase: any,
  vehicleId: string,
  fileName: string,
  documentName: string
) => {
  const { error: docError } = await supabase
    .from('vehicle_documents')
    .insert({
      vehicle_id: vehicleId,
      document_type: 'application/pdf',
      document_url: fileName,
      document_name: documentName
    })

  if (docError) throw docError
}