import { supabase } from "@/integrations/supabase/client";

export const analyzeMarketPricing = async (vehicleData: any) => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a pricing analyst specializing in vehicle rentals."
          },
          {
            role: "user",
            content: `Analyze this vehicle rental data and provide pricing recommendations: ${JSON.stringify(vehicleData)}`
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get DeepSeek analysis');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing market pricing:', error);
    return null;
  }
};