import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    })
    const openai = new OpenAIApi(configuration)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Analyze query intent
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial analysis assistant. Analyze the user's query to determine the financial metrics and data needed."
        },
        {
          role: "user",
          content: query
        }
      ]
    })

    const intent = completion.data.choices[0].message?.content || ''

    // Fetch relevant financial data
    const { data: transactions } = await supabase
      .from('accounting_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    // Generate insights
    const insightCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Generate financial insights based on the data and user query."
        },
        {
          role: "user",
          content: `Query: ${query}\nData: ${JSON.stringify(transactions)}`
        }
      ]
    })

    const insights = insightCompletion.data.choices[0].message?.content || ''

    // Calculate confidence score based on data availability and relevance
    const confidenceScore = 0.85 // Simplified for demo

    return new Response(
      JSON.stringify({
        intent: intent,
        response: {
          insights,
          data: transactions,
          recommendations: []
        },
        confidence: confidenceScore
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})