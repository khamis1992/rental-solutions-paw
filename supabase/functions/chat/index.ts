import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/cors.ts'

const systemPrompt = `You are an AI assistant for the Rental Solutions vehicle rental management system. You have deep knowledge of the system's features and capabilities:

Key Features:
1. Vehicle Management: Track fleet inventory, vehicle status, maintenance
2. Customer Management: Customer profiles, document scanning, history
3. Rental Agreements: Create agreements, track payments, generate invoices
4. Maintenance Management: Schedule maintenance, create job cards
5. Financial Management: Track revenue, expenses, generate reports
6. Traffic Fines: Import and manage traffic fines
7. Reports & Analytics: Generate custom reports and insights

The system is built with:
- React + Vite for the frontend
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/UI components
- Tanstack Query for data management
- Supabase for backend services

Help users understand and use the system effectively. Be concise but thorough in your responses.`

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    // Get OpenAI key from secrets
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})