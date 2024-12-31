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
    const { query } = await req.json()
    console.log('Received smart search query:', query)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Search across multiple tables with relevance scoring
    const [casesPromise, documentsPromise, communicationsPromise] = await Promise.all([
      // Search legal cases
      supabase
        .from('legal_cases')
        .select(`
          id,
          case_type,
          description,
          status,
          priority,
          customer:profiles(full_name),
          created_at
        `)
        .textSearch('description', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(5),

      // Search legal documents
      supabase
        .from('legal_documents')
        .select(`
          id,
          content,
          language,
          status,
          created_at,
          template:legal_document_templates(name)
        `)
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(5),

      // Search communications
      supabase
        .from('legal_communications')
        .select(`
          id,
          type,
          content,
          sent_date,
          delivery_status,
          case_id
        `)
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(5)
    ])

    const [cases, documents, communications] = await Promise.all([
      casesPromise,
      documentsPromise,
      communicationsPromise
    ])

    // Process any errors
    if (cases.error) throw cases.error
    if (documents.error) throw documents.error
    if (communications.error) throw communications.error

    // Calculate relevance scores and combine results
    const results = {
      cases: cases.data?.map(item => ({
        ...item,
        resultType: 'case',
        relevance: calculateRelevance(query, item.description || '')
      })) || [],
      documents: documents.data?.map(item => ({
        ...item,
        resultType: 'document',
        relevance: calculateRelevance(query, item.content || '')
      })) || [],
      communications: communications.data?.map(item => ({
        ...item,
        resultType: 'communication',
        relevance: calculateRelevance(query, item.content || '')
      })) || []
    }

    return new Response(
      JSON.stringify({ success: true, data: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in legal-smart-search function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

// Simple relevance scoring function
function calculateRelevance(query: string, content: string): number {
  const queryTerms = query.toLowerCase().split(' ')
  const contentLower = content.toLowerCase()
  
  // Calculate term frequency
  const termFrequency = queryTerms.reduce((score, term) => {
    const regex = new RegExp(term, 'g')
    const matches = contentLower.match(regex)
    return score + (matches ? matches.length : 0)
  }, 0)

  // Normalize score between 0 and 1
  const maxPossibleScore = queryTerms.length * (content.length / queryTerms[0].length)
  return Math.min(termFrequency / maxPossibleScore, 1)
}