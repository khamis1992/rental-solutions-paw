import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const testUsers = [
      {
        email: 'john.doe@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'John Doe',
          phone_number: '+1234567890',
          address: '123 Test St',
          driver_license: 'DL001'
        }
      },
      {
        email: 'jane.smith@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Jane Smith',
          phone_number: '+1987654321',
          address: '456 Test Ave',
          driver_license: 'DL002'
        }
      },
      {
        email: 'alex.johnson@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Alex Johnson',
          phone_number: '+1122334455',
          address: '789 Test Rd',
          driver_license: 'DL003'
        }
      },
      {
        email: 'emily.brown@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Emily Brown',
          phone_number: '+1555666777',
          address: '321 Test Blvd',
          driver_license: 'DL004'
        }
      },
      {
        email: 'michael.green@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Michael Green',
          phone_number: '+1999888777',
          address: '654 Test Ln',
          driver_license: 'DL005'
        }
      }
    ]

    const results = []
    for (const userData of testUsers) {
      const { data, error } = await supabaseClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      })

      if (error) {
        console.error(`Error creating user ${userData.email}:`, error)
        results.push({ email: userData.email, success: false, error: error.message })
      } else {
        console.log(`Successfully created user ${userData.email}`)
        results.push({ email: userData.email, success: true, userId: data.user.id })
      }
    }

    return new Response(
      JSON.stringify({ message: 'Test users creation completed', results }),
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