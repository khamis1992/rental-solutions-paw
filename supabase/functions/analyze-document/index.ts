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
    const { documentUrl, documentType } = await req.json()
    console.log('Analyzing document:', { documentUrl, documentType })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download document content
    const { data: documentData, error: downloadError } = await supabase
      .storage
      .from('customer_documents')
      .download(documentUrl.split('/').pop())

    if (downloadError) {
      console.error('Error downloading document:', downloadError)
      throw new Error(`Error downloading document: ${downloadError.message}`)
    }

    const documentText = await documentData.text()
    console.log('Document text retrieved, length:', documentText.length)

    // Analyze document using DeepSeek
    const analysis = await analyzeDocument(documentText, documentType)
    console.log('Analysis completed:', analysis)

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in analyze-document function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function analyzeDocument(text: string, documentType: string) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
  if (!deepseekApiKey) {
    throw new Error('DeepSeek API key not configured')
  }
  
  console.log('Calling DeepSeek API...')
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a document analysis expert. Analyze the provided ${documentType} and extract:
              - Document type and classification
              - Key information and data points
              - Validation status (completeness check)
              - Summary of content
              Format your response as a JSON object with these fields:
              {
                "documentType": string,
                "classification": string,
                "extractedData": object,
                "isComplete": boolean,
                "missingFields": string[],
                "summary": string,
                "confidence": number
              }`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error response:', errorText)
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('DeepSeek API raw response:', data)

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from DeepSeek API')
    }

    try {
      return JSON.parse(data.choices[0].message.content)
    } catch (parseError) {
      console.error('Error parsing DeepSeek response:', parseError)
      throw new Error('Failed to parse document analysis response')
    }
  } catch (error) {
    console.error('Error in analyzeDocument:', error)
    throw new Error(`Failed to analyze document: ${error.message}`)
  }
}