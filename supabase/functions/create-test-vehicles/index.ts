import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TEST_VEHICLES = [
  {
    make: 'Toyota',
    model: 'Corolla',
    year: 2024,
    color: 'Silver',
    license_plate: 'TEST-001',
    vin: 'TEST1234567890001',
    status: 'available',
    mileage: 5000,
    description: 'Test vehicle - Toyota Corolla',
    is_test_data: true
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2024,
    color: 'Blue',
    license_plate: 'TEST-002',
    vin: 'TEST1234567890002',
    status: 'available',
    mileage: 3000,
    description: 'Test vehicle - Honda Civic',
    is_test_data: true
  },
  {
    make: 'Ford',
    model: 'Mustang',
    year: 2024,
    color: 'Red',
    license_plate: 'TEST-003',
    vin: 'TEST1234567890003',
    status: 'available',
    mileage: 1000,
    description: 'Test vehicle - Ford Mustang',
    is_test_data: true
  },
  {
    make: 'BMW',
    model: 'X5',
    year: 2024,
    color: 'Black',
    license_plate: 'TEST-004',
    vin: 'TEST1234567890004',
    status: 'available',
    mileage: 2000,
    description: 'Test vehicle - BMW X5',
    is_test_data: true
  },
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    color: 'White',
    license_plate: 'TEST-005',
    vin: 'TEST1234567890005',
    status: 'available',
    mileage: 500,
    description: 'Test vehicle - Tesla Model 3',
    is_test_data: true
  }
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting test vehicles creation...')

    // Insert test vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .insert(TEST_VEHICLES)
      .select()

    if (vehiclesError) {
      throw vehiclesError
    }

    console.log('Test vehicles created successfully:', vehicles)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Test vehicles created successfully',
        data: vehicles
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error in create-test-vehicles function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})