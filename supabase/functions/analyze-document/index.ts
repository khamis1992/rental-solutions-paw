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
    const { documentId, documentUrl, documentType } = await req.json()
    console.log('Analyzing document:', { documentId, documentUrl, documentType })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Analyze document content and classify
    const classification = await analyzeDocument(documentUrl, documentType)
    console.log('Classification results:', classification)

    // Store classification results
    const { error: classificationError } = await supabase
      .from('ai_document_classification')
      .insert({
        document_id: documentId,
        classification_type: classification.type,
        confidence_score: classification.confidence,
        metadata: classification.metadata
      })

    if (classificationError) throw classificationError

    // Update document metadata with classification
    const { error: documentError } = await supabase
      .from('legal_documents')
      .update({
        metadata: {
          classification: classification.type,
          confidence_score: classification.confidence,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', documentId)

    if (documentError) throw documentError

    return new Response(
      JSON.stringify({ 
        success: true, 
        classification 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in document analysis:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function analyzeDocument(documentUrl: string, documentType: string) {
  // This is a simplified document classification system
  // In production, this would use more sophisticated ML models
  
  const documentCategories = {
    'contract': ['agreement', 'contract', 'terms'],
    'court_filing': ['motion', 'petition', 'complaint'],
    'correspondence': ['letter', 'email', 'notice'],
    'evidence': ['exhibit', 'proof', 'documentation'],
    'financial': ['invoice', 'statement', 'receipt']
  }

  // Simulate document content analysis
  const mockAnalysis = {
    type: 'contract',
    confidence: 0.85,
    metadata: {
      detected_entities: ['dates', 'parties', 'terms'],
      key_terms: ['agreement', 'liability', 'termination'],
      document_structure: {
        has_signature: true,
        has_dates: true,
        has_numbered_sections: true
      }
    }
  }

  // In production, this would perform actual document analysis
  // using ML models and natural language processing
  
  return mockAnalysis
}