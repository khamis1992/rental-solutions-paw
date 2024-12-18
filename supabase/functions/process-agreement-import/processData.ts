import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { validateRowData, extractRowData } from './utils.ts';

export const processImportData = async (
  supabase: ReturnType<typeof createClient>,
  rows: string[],
  headers: string[],
  fileName: string
) => {
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  const batchSize = 50; // Process 50 records at a time
  const agreements = [];

  // Get first available vehicle for testing
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('status', 'available')
    .limit(1)
    .single();

  const defaultVehicleId = vehicle?.id;

  // Process rows in batches
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;

    try {
      console.log(`Processing row ${i}:`, rows[i]);
      const currentRowValues = rows[i].split(',').map(v => v.trim());
      const rowData = extractRowData(currentRowValues, headers);
      
      // Prepare agreement data
      const agreementData = {
        agreement_number: rowData.agreementNumber,
        license_no: rowData.licenseNo,
        license_number: rowData.licenseNumber,
        checkout_date: rowData.checkoutDate || new Date().toISOString(),
        checkin_date: rowData.checkinDate || new Date().toISOString(),
        return_date: rowData.returnDate || new Date().toISOString(),
        status: rowData.status?.toLowerCase() || 'pending',
        customer_id: null as string | null,
        vehicle_id: defaultVehicleId,
        total_amount: 0,
        initial_mileage: 0
      };

      // Get or create customer profile
      try {
        const { data: customerData } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', rowData.fullName)
          .single();

        if (customerData) {
          agreementData.customer_id = customerData.id;
        } else {
          const { data: newCustomer } = await supabase
            .from('profiles')
            .insert({
              full_name: rowData.fullName || `Unknown Customer ${Date.now()}`,
              role: 'customer'
            })
            .select()
            .single();
          
          agreementData.customer_id = newCustomer?.id || null;
        }
      } catch (error) {
        console.error('Error with customer profile:', error);
        // Create a placeholder profile
        const { data: newCustomer } = await supabase
          .from('profiles')
          .insert({
            full_name: `Unknown Customer ${Date.now()}`,
            role: 'customer'
          })
          .select()
          .single();
        
        agreementData.customer_id = newCustomer?.id;
      }

      agreements.push(agreementData);
      
      // Process in batches
      if (agreements.length === batchSize || i === rows.length - 1) {
        try {
          const { error: batchError } = await supabase
            .from('leases')
            .upsert(agreements, {
              onConflict: 'agreement_number',
              ignoreDuplicates: false
            });

          if (batchError) {
            console.error(`Batch insert error:`, batchError);
            errorCount += agreements.length;
            errors.push({
              rows: `${i - agreements.length + 1} to ${i}`,
              error: batchError.message
            });
          } else {
            successCount += agreements.length;
          }
        } catch (batchError) {
          console.error(`Failed to insert batch:`, batchError);
          errorCount += agreements.length;
          errors.push({
            rows: `${i - agreements.length + 1} to ${i}`,
            error: batchError.message
          });
        }
        
        // Clear the batch array
        agreements.length = 0;
      }
    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      errors.push({
        row: i + 1,
        error: error.message,
        data: rows[i]
      });
      errorCount++;
    }
  }

  // Update import log with results
  try {
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount + errorCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName);
  } catch (error) {
    console.error('Error updating import log:', error);
  }

  return { successCount, errorCount, errors };
};