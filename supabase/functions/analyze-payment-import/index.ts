import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      throw new Error('No file provided');
    }

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Analyze headers
    const requiredHeaders = ['Customer Name', 'Amount', 'Payment_Date', 'Payment_Method', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      warnings.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    // Analyze data rows
    let validRows = 0;
    let invalidDates = 0;
    let invalidAmounts = 0;
    let unknownCustomers = 0;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const record: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      // Validate date format (DD-MM-YYYY)
      if (record.Payment_Date && !/^\d{2}-\d{2}-\d{4}$/.test(record.Payment_Date)) {
        invalidDates++;
      }

      // Validate amount is a number
      if (record.Amount && isNaN(parseFloat(record.Amount))) {
        invalidAmounts++;
      }

      // Check if customer exists
      if (record['Customer Name']) {
        const { data: customer } = await supabase
          .from('profiles')
          .select('id')
          .ilike('full_name', record['Customer Name'])
          .maybeSingle();

        if (!customer) {
          unknownCustomers++;
        }
      }

      validRows++;
    }

    // Generate warnings and suggestions
    if (invalidDates > 0) {
      warnings.push(`Found ${invalidDates} rows with invalid date format. Dates should be in DD-MM-YYYY format.`);
    }

    if (invalidAmounts > 0) {
      warnings.push(`Found ${invalidAmounts} rows with invalid amount values.`);
    }

    if (unknownCustomers > 0) {
      warnings.push(`Found ${unknownCustomers} customers that don't exist in the system.`);
      suggestions.push('Consider creating customer profiles before importing payments.');
    }

    const summary = `Analyzed ${validRows} payment records. Found ${warnings.length} potential issues that need attention.`;

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        warnings,
        suggestions,
        stats: {
          totalRows: validRows,
          invalidDates,
          invalidAmounts,
          unknownCustomers,
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error analyzing payment import:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});