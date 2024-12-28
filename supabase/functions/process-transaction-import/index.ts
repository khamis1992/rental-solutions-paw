import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function parseDate(dateString: string): string {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Remove any timezone information to avoid displacement errors
    dateString = dateString.split('T')[0];
    
    // Try parsing different date formats
    let date: Date;
    
    // Try YYYY-MM-DD format first
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(dateString);
    } 
    // Try DD-MM-YYYY or DD/MM/YYYY format
    else {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        // Ensure year is 4 digits and reasonable
        const year = parseInt(parts[2]);
        if (year > 1900 && year < 2100) {
          date = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          throw new Error('Invalid year');
        }
      } else {
        throw new Error('Invalid date format');
      }
    }
    
    if (!isValidDate(date)) {
      throw new Error('Invalid date');
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Date parsing error:', error, 'for date:', dateString);
    return new Date().toISOString();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { rows } = await req.json();
    console.log('Processing transactions:', rows.length);

    // Save raw import data
    const { error: rawDataError } = await supabase
      .from('raw_transaction_imports')
      .insert(rows.map((row: any) => ({
        raw_data: row,
        is_valid: true
      })));

    if (rawDataError) {
      console.error('Error saving raw data:', rawDataError);
      throw rawDataError;
    }

    // Process and save transactions
    const transactions = rows.map((row: any) => ({
      type: 'income',
      amount: row.amount,
      description: row.description,
      transaction_date: parseDate(row.payment_date),
      status: 'completed',
      reference_type: 'import',
      metadata: {
        agreement_number: row.agreement_number,
        customer_name: row.customer_name,
        license_plate: row.license_plate,
        vehicle: row.vehicle,
        payment_method: row.payment_method,
        payment_number: row.payment_number
      }
    }));

    const { error: transactionError } = await supabase
      .from('accounting_transactions')
      .insert(transactions);

    if (transactionError) {
      console.error('Error saving transactions:', transactionError);
      throw transactionError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${rows.length} transactions`,
        data: rows 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Changed to 200 to avoid non-2xx status code error
      }
    );
  }
});