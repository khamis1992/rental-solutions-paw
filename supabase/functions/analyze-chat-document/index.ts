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
    const { documentUrl, documentType, customerId } = await req.json()
    console.log('Analyzing document:', { documentUrl, documentType, customerId })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First verify the customer exists
    const { data: customer, error: customerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      console.error('Customer not found:', customerError)
      return new Response(
        JSON.stringify({ error: 'Customer not found', details: customerError?.message }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    // Call Perplexity API to analyze the document
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing documents. Extract key information like dates, amounts, and relevant details. Return the data in a structured format.'
          },
          {
            role: 'user',
            content: `Please analyze this document: ${documentUrl}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      console.error('Perplexity API error:', await response.text())
      throw new Error('Failed to analyze document')
    }

    const analysisResult = await response.json()
    console.log('Analysis result:', analysisResult)

    // Extract structured data from the analysis
    const extractedData = {
      documentType,
      analysisDate: new Date().toISOString(),
      extractedText: analysisResult.choices[0].message.content,
      confidence: 0.85
    }

    // Store document metadata
    const { error: docError } = await supabase
      .from('document_analysis_logs')
      .insert({
        profile_id: customerId,
        document_type: documentType,
        document_url: documentUrl,
        extracted_data: extractedData,
        confidence_score: extractedData.confidence,
        status: 'completed'
      })

    if (docError) {
      console.error('Error storing document analysis:', docError)
      throw docError
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in analyze-chat-document function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})