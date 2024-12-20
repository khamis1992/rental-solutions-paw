import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all profiles
    const { data: profiles, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError

    // Track seen names and IDs to delete
    const seenNames = new Map()
    const idsToDelete = []

    // Find duplicates (keeping the earliest entry)
    profiles.forEach((profile) => {
      if (seenNames.has(profile.full_name)) {
        idsToDelete.push(profile.id)
      } else {
        seenNames.set(profile.full_name, profile.id)
      }
    })

    // Delete duplicates
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabaseClient
        .from('profiles')
        .delete()
        .in('id', idsToDelete)

      if (deleteError) throw deleteError
    }

    return new Response(
      JSON.stringify({
        success: true,
        deletedCount: idsToDelete.length,
        message: `Successfully deleted ${idsToDelete.length} duplicate profiles`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})