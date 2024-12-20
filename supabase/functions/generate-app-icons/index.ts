import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const hf = new HfInference(Deno.env.get('HUGGING_FACE_ACCESS_TOKEN'))
    
    // Generate the largest icon first (512x512)
    const prompt = "A minimalist icon for a car rental app, flat design, modern, professional, white background"
    
    const originalImage = await hf.textToImage({
      inputs: prompt,
      model: 'black-forest-labs/FLUX.1-schnell',
      parameters: {
        width: 512,
        height: 512
      }
    })

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const uploadPromises = ICON_SIZES.map(async (size) => {
      const fileName = `icon-${size}x${size}.png`
      
      // Upload each size
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('company_assets')
        .upload(`icons/${fileName}`, originalImage, {
          contentType: 'image/png',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get the public URL for each icon
      const { data: { publicUrl } } = supabase
        .storage
        .from('company_assets')
        .getPublicUrl(`icons/${fileName}`)

      return {
        size,
        url: publicUrl
      }
    })

    const iconUrls = await Promise.all(uploadPromises)

    return new Response(
      JSON.stringify({ 
        message: 'Icons generated and uploaded successfully',
        icons: iconUrls
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})