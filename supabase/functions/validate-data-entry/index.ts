import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  entityType: 'customer' | 'vehicle' | 'lease';
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entityType, data }: ValidationRequest = await req.json();

    const validationRules = {
      customer: {
        full_name: (value: string) => value?.length >= 2,
        phone_number: (value: string) => /^\+?[\d\s-]{10,}$/.test(value),
        email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      },
      vehicle: {
        license_plate: (value: string) => /^[A-Z0-9-]{5,}$/.test(value),
        vin: (value: string) => /^[A-HJ-NPR-Z0-9]{17}$/.test(value),
        year: (value: number) => value >= 1900 && value <= new Date().getFullYear() + 1,
      },
      lease: {
        start_date: (value: string) => new Date(value) >= new Date(),
        end_date: (value: string, data: any) => new Date(value) > new Date(data.start_date),
        total_amount: (value: number) => value > 0,
      },
    };

    const errors: Record<string, string> = {};
    const rules = validationRules[entityType];

    for (const [field, validator] of Object.entries(rules)) {
      if (data[field] !== undefined && !validator(data[field], data)) {
        errors[field] = `Invalid ${field.replace('_', ' ')}`;
      }
    }

    // Check for duplicate entries
    if (Object.keys(errors).length === 0) {
      const { data: existingData, error: queryError } = await supabase
        .from(entityType === 'customer' ? 'profiles' : `${entityType}s`)
        .select('id')
        .match(
          entityType === 'vehicle' 
            ? { license_plate: data.license_plate }
            : entityType === 'customer'
            ? { email: data.email }
            : {}
        )
        .maybeSingle();

      if (existingData) {
        errors.duplicate = `This ${entityType} already exists`;
      }
    }

    // Log validation attempt for monitoring
    await supabase.from('audit_logs').insert({
      action: 'data_validation',
      entity_type: entityType,
      changes: { 
        data,
        validation_errors: Object.keys(errors).length > 0 ? errors : null 
      },
    });

    return new Response(
      JSON.stringify({
        success: Object.keys(errors).length === 0,
        errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in validate-data-entry function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});