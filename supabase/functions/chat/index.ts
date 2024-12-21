import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

const systemPrompt = `You are an AI assistant for the Rental Solutions vehicle rental management system. You have deep knowledge of both the system's features and real-time data:

Key Features & Data Access:
1. Vehicle Management
   - Track fleet inventory, vehicle status, maintenance schedules
   - Access to vehicle details including make, model, year, status
   - Monitor real-time vehicle sensor data and maintenance history

2. Customer Management
   - Customer profiles with document verification
   - Credit assessments and risk analysis
   - Payment history and rental preferences

3. Rental Agreements
   - Contract creation and management
   - Payment tracking and invoicing
   - Document management and verification

4. Financial Management
   - Revenue tracking and expense management
   - Payment reconciliation
   - Financial forecasting and insights

5. Maintenance System
   - Service scheduling and tracking
   - Predictive maintenance recommendations
   - Job cards and service history

6. Traffic Fines
   - Fine management and assignment
   - Payment tracking
   - Violation history

Database Structure:
- Access to 50+ interconnected tables
- Real-time data updates through Supabase
- Comprehensive audit logging
- Document storage and analysis

Security & Compliance:
- Role-based access control
- Document verification workflows
- Audit trails for all major actions

I can help users by:
1. Explaining any system feature or workflow
2. Providing real-time data insights
3. Troubleshooting issues
4. Suggesting best practices
5. Guiding through complex processes
`;

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    // Get Perplexity API key from secrets
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      console.error('Perplexity API key not configured');
      throw new Error('Chat service is not properly configured');
    }

    console.log('Making request to Perplexity API...');
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    const data = await response.json();
    console.log('Perplexity API response:', data);
    
    if (!response.ok) {
      console.error('Perplexity API error:', data);
      throw new Error(data.error?.message || 'Failed to get response from Perplexity');
    }

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from chat service');
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
