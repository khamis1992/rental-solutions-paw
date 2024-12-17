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
  let errors: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    if (!rows[i].trim()) continue;

    let currentRowValues: string[] = [];
    try {
      currentRowValues = rows[i].split(',').map(v => v.trim());
      
      if (currentRowValues.length !== headers.length) {
        throw new Error(`Row has incorrect number of columns. Expected ${headers.length}, got ${currentRowValues.length}`);
      }

      const rowData = extractRowData(currentRowValues, headers);
      const mappedStatus = validateRowData(rowData, headers);

      // Get customer ID from full name
      const { data: customerData, error: customerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', rowData.fullName)
        .single();

      if (customerError || !customerData) {
        throw new Error(`Customer "${rowData.fullName}" not found`);
      }

      // Create lease record
      const { error: leaseError } = await supabase
        .from('leases')
        .insert({
          customer_id: customerData.id,
          agreement_number: rowData.agreementNumber,
          license_no: rowData.licenseNo,
          license_number: rowData.licenseNumber,
          checkout_date: rowData.checkoutDate,
          checkin_date: rowData.checkinDate,
          return_date: rowData.returnDate,
          status: mappedStatus,
        });

      if (leaseError) {
        throw leaseError;
      }

      successCount++;
      console.log(`Successfully imported agreement: ${rowData.agreementNumber}`);

    } catch (error) {
      console.error(`Error processing row ${i + 1}:`, error);
      errorCount++;
      
      const errorData = {
        row: i + 1,
        error: error.message,
        data: currentRowValues.length ? Object.fromEntries(headers.map((h, idx) => [h, currentRowValues[idx]])) : null
      };
      errors.push(errorData);

      await supabase
        .from('agreement_import_errors')
        .insert({
          import_log_id: (await supabase
            .from('import_logs')
            .select('id')
            .eq('file_name', fileName)
            .single()).data?.id,
          row_number: i + 1,
          error_message: error.message,
          row_data: errorData.data
        });
    }
  }

  return { successCount, errorCount, errors };
};