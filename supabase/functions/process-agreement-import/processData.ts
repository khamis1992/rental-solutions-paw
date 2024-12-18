import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { parseDate } from './dateUtils.ts';
import { normalizeStatus } from './statusUtils.ts';

export const processImportData = async (
  supabase: ReturnType<typeof createClient>,
  rows: string[],
  headers: string[],
  fileName: string
) => {
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  const batchSize = 50;
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
    try {
      console.log(`Processing row ${i}:`, rows[i]);
      const values = rows[i].split(',').map(v => v.trim());
      
      const agreementNumber = values[headers.indexOf('Agreement Number')]?.trim() || `AGR${Date.now()}`;
      const licenseNo = values[headers.indexOf('License No')]?.trim();
      const fullName = values[headers.indexOf('full_name')]?.trim();
      const licenseNumber = values[headers.indexOf('License Number')]?.trim();
      const checkoutDate = parseDate(values[headers.indexOf('Check-out Date')]?.trim());
      const checkinDate = parseDate(values[headers.indexOf('Check-in Date')]?.trim());
      const returnDate = parseDate(values[headers.indexOf('Return Date')]?.trim());
      const status = normalizeStatus(values[headers.indexOf('STATUS')]?.trim());

      // Get or create customer profile
      let customerId: string | null = null;
      try {
        const { data: customerData } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', fullName)
          .single();

        if (customerData) {
          customerId = customerData.id;
        } else {
          const { data: newCustomer } = await supabase
            .from('profiles')
            .insert({
              full_name: fullName || `Unknown Customer ${Date.now()}`,
              role: 'customer'
            })
            .select()
            .single();
          
          customerId = newCustomer?.id;
        }
      } catch (error) {
        console.error('Error with customer profile:', error);
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

      agreements.push({
        agreement_number: agreementNumber,
        license_no: licenseNo,
        license_number: licenseNumber,
        checkout_date: checkoutDate,
        checkin_date: checkinDate,
        return_date: returnDate,
        status,
        customer_id: customerId,
        vehicle_id: defaultVehicleId,
        total_amount: 0,
        initial_mileage: 0
      });

      if (agreements.length === batchSize || i === rows.length - 1) {
        const { error: batchError } = await supabase
          .from('leases')
          .upsert(agreements, {
            onConflict: 'agreement_number',
            ignoreDuplicates: false
          });

        if (batchError) {
          console.error('Batch insert error:', batchError);
          errorCount += agreements.length;
          errors.push({
            rows: `${i - agreements.length + 1} to ${i}`,
            error: batchError.message
          });
        } else {
          successCount += agreements.length;
        }
        
        agreements.length = 0;
      }
    } catch (error) {
      console.error(`Error processing row ${i}:`, error);
      errors.push({
        row: i,
        error: error.message
      });
      errorCount++;
    }
  }

  // Update import log
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