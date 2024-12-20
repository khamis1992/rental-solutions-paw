import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get company logo URL from settings
    const { data: settings, error: settingsError } = await supabase
      .from('company_settings')
      .select('logo_url')
      .single();

    if (settingsError) throw settingsError;
    if (!settings?.logo_url) {
      throw new Error('Company logo not found in settings');
    }

    // Fetch the logo image
    const response = await fetch(settings.logo_url);
    if (!response.ok) throw new Error('Failed to fetch company logo');
    const logoImage = await response.blob();

    const uploadPromises = ICON_SIZES.map(async (size) => {
      const fileName = `icon-${size}x${size}.png`
      
      // Upload each size
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('company_assets')
        .upload(`icons/${fileName}`, logoImage, {
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
        message: 'Company logo icons generated and uploaded successfully',
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