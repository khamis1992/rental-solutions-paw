import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportItem {
  id: string;
  customer_id?: string;
  agreement_number?: string;
  amount: number;
  description?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { importId } = await req.json()

    console.log('Starting auto-assignment for import:', importId)

    // Get all unassigned items from this import
    const { data: importItems, error: itemsError } = await supabaseClient
      .from('transaction_import_items')
      .select('*')
      .eq('import_id', importId)
      .is('customer_id', null)

    if (itemsError) {
      throw itemsError
    }

    console.log('Found unassigned items:', importItems?.length)

    const assignments: Array<{ itemId: string; customerId?: string; agreementId?: string }> = []

    // Process each unassigned item
    for (const item of (importItems || [])) {
      // Try to find matching agreement by agreement number
      if (item.description?.includes('Agreement:')) {
        const agreementNumber = item.description.match(/Agreement:\s*([A-Z0-9-]+)/)?.[1]
        if (agreementNumber) {
          const { data: agreement } = await supabaseClient
            .from('leases')
            .select('id, customer_id')
            .eq('agreement_number', agreementNumber)
            .single()

          if (agreement) {
            assignments.push({
              itemId: item.id,
              customerId: agreement.customer_id,
              agreementId: agreement.id
            })
            continue
          }
        }
      }

      // Try to find matching customer by name
      const { data: customers } = await supabaseClient
        .from('profiles')
        .select('id, full_name')
        
      const potentialMatches = customers?.filter(customer => 
        item.description?.toLowerCase().includes(customer.full_name?.toLowerCase() || '')
      )

      if (potentialMatches?.length === 1) {
        assignments.push({
          itemId: item.id,
          customerId: potentialMatches[0].id
        })
      }
    }

    console.log('Found assignments:', assignments.length)

    // Update assigned items
    for (const assignment of assignments) {
      await supabaseClient
        .from('transaction_import_items')
        .update({
          customer_id: assignment.customerId,
          status: 'assigned'
        })
        .eq('id', assignment.itemId)
    }

    // Update import record
    await supabaseClient
      .from('transaction_imports')
      .update({
        auto_assigned: true,
        assignment_details: {
          total_items: importItems?.length || 0,
          assigned_items: assignments.length,
          assignment_date: new Date().toISOString()
        }
      })
      .eq('id', importId)

    return new Response(
      JSON.stringify({
        success: true,
        assigned: assignments.length,
        total: importItems?.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in auto-assign:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})