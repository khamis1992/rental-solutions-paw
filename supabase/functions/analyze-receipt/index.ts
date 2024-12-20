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
    const { filePath } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('receipts')
      .download(filePath)

    if (fileError) throw fileError

    // TODO: Implement OCR and AI analysis here
    // For now, return mock data
    const mockAnalysis = {
      amount: 150.00,
      date: new Date().toISOString(),
      vendor: "Sample Store",
      category: "Office Supplies",
      confidence: 0.95
    }

    // Store the analysis result
    const { error: insertError } = await supabase
      .from('expense_transactions')
      .insert({
        amount: mockAnalysis.amount,
        description: `Purchase from ${mockAnalysis.vendor}`,
        ai_confidence_score: mockAnalysis.confidence,
        receipt_url: filePath,
      })

    if (insertError) throw insertError

    return new Response(
      JSON.stringify(mockAnalysis),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      },
    )
  }
})