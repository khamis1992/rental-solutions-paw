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
    const { documentUrl, query, documentId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document content from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('agreement_documents')
      .download(documentUrl)

    if (fileError) throw fileError

    const documentContent = await fileData.text()

    // Call Perplexity AI for document analysis
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a legal document analysis expert. ${
              query ? 'Answer questions about the document.' : 
              'Analyze the document and provide: 1) Simple explanations of legal terms, 2) Key highlights including payment terms, liabilities, and obligations, 3) A summary of critical sections.'
            }`
          },
          {
            role: 'user',
            content: query ? 
              `Based on this document: ${documentContent}\n\nAnswer this question: ${query}` :
              `Analyze this document: ${documentContent}`
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const analysisResult = await response.json()

    // Store analysis results
    const { error: dbError } = await supabase
      .from('ai_document_classification')
      .insert({
        document_id: documentId,
        classification_type: 'legal_analysis',
        confidence_score: 0.9,
        metadata: {
          analysis: analysisResult.choices[0].message.content,
          analyzed_at: new Date().toISOString(),
          query: query || null
        }
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({ 
        analysis: analysisResult.choices[0].message.content
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