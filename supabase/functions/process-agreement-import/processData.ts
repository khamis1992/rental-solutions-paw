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
      console.log(`Processing row ${i}:`, rows[i]);
      const currentRowValues = rows[i].split(',').map(v => v.trim());
      const rowData = extractRowData(currentRowValues, headers);
      
      // Get or create customer profile
      let customerId;
      try {
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
      } catch (error) {
        console.error('Error with customer profile, creating new one:', error);
        // Force create a new profile
        const { data: newCustomer } = await supabase
          .from('profiles')
          .insert({
            full_name: `Unknown Customer ${Date.now()}`,
            role: 'customer'
          })
          .select()
          .single();
        
        customerId = newCustomer?.id;
      }

      console.log('Customer ID:', customerId);
      console.log('Parsed dates:', {
        checkout: rowData.checkoutDate,
        checkin: rowData.checkinDate,
        return: rowData.returnDate
      });

      // Try to insert lease record, if it fails, log the error but continue processing
      try {
        const { error: leaseError } = await supabase
          .from('leases')
          .upsert({
            agreement_number: rowData.agreementNumber,
            customer_id: customerId,
            vehicle_id: defaultVehicleId,
            license_no: rowData.licenseNo,
            license_number: rowData.licenseNumber,
            checkout_date: rowData.checkoutDate,
            checkin_date: rowData.checkinDate,
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
          // Log the error but don't throw it - continue processing
          errors.push({
            row: i + 1,
            error: leaseError.message,
            data: rows[i]
          });
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully imported agreement: ${rowData.agreementNumber}`);
        }
      } catch (insertError) {
        console.error(`Failed to insert lease for row ${i + 1}:`, insertError);
        errors.push({
          row: i + 1,
          error: insertError.message,
          data: rows[i]
        });
        errorCount++;
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