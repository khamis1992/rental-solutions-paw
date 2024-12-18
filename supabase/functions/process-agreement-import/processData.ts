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

  // Get first available vehicle for testing
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id')
    .eq('status', 'available')
    .limit(1)
    .single();

  const defaultVehicleId = vehicle?.id;

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;

    try {
      const currentRowValues = rows[i].split(',').map(v => v.trim());
      const rowData = extractRowData(currentRowValues, headers);
      
      // Get customer ID or create a placeholder
      let customerId;
      const { data: customerData } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', rowData.fullName)
        .single();

      if (customerData) {
        customerId = customerData.id;
      } else {
        // Create a placeholder profile
        const { data: newCustomer } = await supabase
          .from('profiles')
          .insert({
            full_name: rowData.fullName,
            role: 'customer'
          })
          .select()
          .single();
        customerId = newCustomer?.id;
      }

      // Insert lease record with available data
      const { error: leaseError } = await supabase
        .from('leases')
        .upsert({
          agreement_number: rowData.agreementNumber,
          customer_id: customerId,
          vehicle_id: defaultVehicleId,
          license_no: rowData.licenseNo,
          license_number: rowData.licenseNumber,
          start_date: rowData.checkoutDate,
          end_date: rowData.checkinDate,
          return_date: rowData.returnDate,
          status: rowData.status || 'pending',
          total_amount: 0,
          initial_mileage: 0,
        }, {
          onConflict: 'agreement_number',
          ignoreDuplicates: false
        });

      if (leaseError) {
        console.error(`Row ${i + 1} insert error:`, leaseError);
        throw leaseError;
      }

      successCount++;
      console.log(`Successfully imported agreement: ${rowData.agreementNumber}`);

    } catch (error: any) {
      console.error(`Error processing row ${i + 1}:`, error);
      errorCount++;
      errors.push({
        row: i + 1,
        error: error.message,
        data: rows[i]
      });
    }
  }

  return { successCount, errorCount, errors };
};