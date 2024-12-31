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
    const { query, caseId } = await req.json()
    console.log('Received legal research query:', query, 'for case:', caseId)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Simulate Al Meezan API call (replace with actual API integration)
    const searchResults = await searchAlMeezanPortal(query)
    console.log('Search results:', searchResults)

    // Store the query and results in the database
    const { error: dbError } = await supabase
      .from('legal_research_queries')
      .insert({
        case_id: caseId,
        query_text: query,
        results: searchResults,
        performed_by: req.headers.get('x-user-id')
      })

    if (dbError) {
      console.error('Error storing research query:', dbError)
      throw dbError
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: searchResults 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in legal research function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    )
  }
})

// Mock function for Al Meezan Portal search
// This should be replaced with actual API integration
async function searchAlMeezanPortal(query: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Return mock results
  return {
    timestamp: new Date().toISOString(),
    query: query,
    results: [
      {
        title: "Law No. 22 of 2004 Regarding Promulgating the Civil Code",
        relevance: 0.95,
        summary: "Articles related to civil transactions and obligations",
        url: "https://almeezan.qa/LawPage.aspx?id=2559",
        language: "en"
      },
      {
        title: "Law No. 27 of 2019 Promulgating the Law on Evidence in Civil and Commercial Matters",
        relevance: 0.85,
        summary: "Provisions concerning evidence in civil and commercial cases",
        url: "https://almeezan.qa/LawPage.aspx?id=8211",
        language: "en"
      }
    ]
  }
}