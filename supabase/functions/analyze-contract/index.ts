import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentUrl, documentId } = await req.json();
    console.log('Analyzing document:', { documentUrl, documentId });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Download document content
    const { data: documentData, error: downloadError } = await supabaseClient
      .storage
      .from('customer_documents')
      .download(documentUrl.split('/').pop());

    if (downloadError) {
      console.error('Error downloading document:', downloadError);
      throw new Error(`Error downloading document: ${downloadError.message}`);
    }

    const documentText = await documentData.text();
    console.log('Document text retrieved, length:', documentText.length);

    // Analyze contract using DeepSeek
    const analysis = await analyzeContract(documentText);
    console.log('Analysis completed:', analysis);

    // Store analysis results
    const { error: insertError } = await supabaseClient
      .from('ai_document_classification')
      .insert({
        document_id: documentId,
        classification_type: 'contract_analysis',
        confidence_score: analysis.confidence,
        metadata: {
          key_terms: analysis.keyTerms,
          obligations: analysis.obligations,
          risks: analysis.risks,
          recommendations: analysis.recommendations,
          analyzed_at: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Error storing analysis:', insertError);
      throw new Error(`Error storing analysis: ${insertError.message}`);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-contract function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeContract(text: string) {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!deepseekApiKey) {
    throw new Error('DeepSeek API key not configured');
  }
  
  console.log('Calling DeepSeek API...');
  
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
            content: `You are a legal contract analysis expert. Analyze the provided contract text and extract:
              - Key terms and conditions
              - Obligations for both parties
              - Potential risks and liabilities
              - Recommendations for improvement or negotiation
              Provide a confidence score for your analysis.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API raw response:', data);

    // Parse the response content as JSON
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return {
      keyTerms: analysis.keyTerms || [],
      obligations: analysis.obligations || [],
      risks: analysis.risks || [],
      recommendations: analysis.recommendations || [],
      confidence: analysis.confidence || 0.8
    };
  } catch (error) {
    console.error('Error in analyzeContract:', error);
    throw new Error(`Failed to analyze contract: ${error.message}`);
  }
}