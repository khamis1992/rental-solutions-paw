import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders } from "../_shared/cors.ts";

interface PaymentRow {
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description?: string;
  transaction_id?: string;
  lease_id?: string; // Make lease_id optional in the interface
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const contractName = formData.get('contractName');

    if (!file || !contractName) {
      throw new Error('File and contract name are required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const content = await file.text();
    const lines = content.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    // Validate required headers
    const requiredHeaders = ['amount', 'payment_date', 'payment_method', 'status', 'lease_id'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({
          error: 'Missing required headers',
          details: `Missing headers: ${missingHeaders.join(', ')}. The lease_id column is required.`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const payments: PaymentRow[] = [];
    const errors: any[] = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        // Validate lease_id
        if (!row.lease_id) {
          throw new Error(`Missing lease_id in row ${i}`);
        }

        // Verify lease exists
        const { data: leaseExists, error: leaseError } = await supabase
          .from('leases')
          .select('id')
          .eq('id', row.lease_id)
          .single();

        if (leaseError || !leaseExists) {
          throw new Error(`Invalid lease_id in row ${i}: ${row.lease_id}`);
        }

        // Validate and parse date
        const paymentDate = new Date(row.payment_date);
        if (isNaN(paymentDate.getTime())) {
          throw new Error(`Invalid date format in row ${i}`);
        }

        // Validate amount
        const amount = parseFloat(row.amount);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount in row ${i}`);
        }

        payments.push({
          amount,
          payment_date: paymentDate.toISOString(),
          payment_method: row.payment_method,
          status: row.status,
          description: row.description || null,
          transaction_id: row.transaction_id || null,
          lease_id: row.lease_id
        });
      } catch (error) {
        errors.push({
          row: i,
          error: error.message,
          data: row
        });
      }
    }

    // Create import log
    const { data: importLog, error: importLogError } = await supabase
      .from('import_logs')
      .insert({
        file_name: (file as File).name,
        import_type: 'payment',
        status: 'processing',
        records_processed: 0,
        errors: errors.length > 0 ? { failed: errors } : null
      })
      .select()
      .single();

    if (importLogError) throw importLogError;

    // Insert payments
    if (payments.length > 0) {
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(payments.map(payment => ({
          ...payment,
          created_at: payment.payment_date,
          metadata: { contract_name: contractName }
        })));

      if (paymentsError) throw paymentsError;

      // Update import log
      await supabase
        .from('import_logs')
        .update({
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          records_processed: payments.length
        })
        .eq('id', importLog.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: payments.length,
        errors: errors.length > 0 ? errors : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to process import',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});