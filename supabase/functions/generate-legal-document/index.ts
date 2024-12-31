import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { templateId, variables, caseId } = await req.json()

    if (!templateId || !variables) {
      throw new Error('Template ID and variables are required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('legal_document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) throw templateError
    if (!template) throw new Error('Template not found')

    // Generate document content by replacing variables
    let content = template.content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(regex, String(value))
    })

    // Create new document
    const { data: document, error: documentError } = await supabase
      .from('legal_documents')
      .insert({
        case_id: caseId,
        template_id: templateId,
        content: content,
        language: template.language,
        generated_by: req.headers.get('x-user-id'),
        status: 'draft'
      })
      .select()
      .single()

    if (documentError) throw documentError

    // Create initial version
    const { error: versionError } = await supabase
      .from('legal_document_versions')
      .insert({
        document_id: document.id,
        version_number: 1,
        content: content,
        changes_summary: 'Initial version',
        status: 'draft'
      })

    if (versionError) throw versionError

    console.log('Document generated successfully:', document.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: document.id,
        content 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating document:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})