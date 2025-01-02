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
    const { documentId, documentContent, documentType } = await req.json()
    console.log('Analyzing document:', { documentId, documentType })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Analyze document content and classify
    // This is a simplified classification system
    // In production, you would use more sophisticated ML models
    const classification = analyzeDocument(documentContent, documentType)
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

function analyzeDocument(content: string, type: string) {
  // This is a simplified document classification system
  // In production, this would use ML models for more accurate classification
  
  const documentTypes = {
    'contract': ['agreement', 'contract', 'terms'],
    'court_filing': ['motion', 'petition', 'complaint'],
    'correspondence': ['letter', 'email', 'notice'],
    'evidence': ['exhibit', 'proof', 'documentation']
  }

  let maxMatches = 0
  let classifiedType = 'unknown'
  let confidence = 0

  // Count keyword matches for each document type
  for (const [docType, keywords] of Object.entries(documentTypes)) {
    const matches = keywords.filter(keyword => 
      content.toLowerCase().includes(keyword.toLowerCase())
    ).length

    if (matches > maxMatches) {
      maxMatches = matches
      classifiedType = docType
      confidence = Math.min(matches / keywords.length, 0.95) // Cap at 95% confidence
    }
  }

  return {
    type: classifiedType,
    confidence: confidence,
    metadata: {
      analysis_method: 'keyword_matching',
      analyzed_at: new Date().toISOString(),
      content_length: content.length,
      detected_keywords: documentTypes[classifiedType as keyof typeof documentTypes] || []
    }
  }
}