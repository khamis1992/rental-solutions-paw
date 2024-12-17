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
        email: 'john.smith@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'John Smith',
          phone_number: '+974 3333 4444',
          address: 'West Bay, Doha',
          driver_license: 'DL123456'
        }
      },
      {
        email: 'sarah.johnson@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Sarah Johnson',
          phone_number: '+974 5555 6666',
          address: 'The Pearl, Doha',
          driver_license: 'DL789012'
        }
      },
      {
        email: 'mohammed.alsayed@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Mohammed Al-Sayed',
          phone_number: '+974 7777 8888',
          address: 'Al Sadd, Doha',
          driver_license: 'DL345678'
        }
      },
      {
        email: 'fatima.ahmed@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'Fatima Ahmed',
          phone_number: '+974 9999 0000',
          address: 'Lusail City',
          driver_license: 'DL901234'
        }
      },
      {
        email: 'david.wilson@example.com',
        password: 'password123',
        user_metadata: {
          full_name: 'David Wilson',
          phone_number: '+974 1111 2222',
          address: 'Al Wakrah',
          driver_license: 'DL567890'
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