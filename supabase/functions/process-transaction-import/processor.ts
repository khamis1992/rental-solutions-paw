import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { validateCSVHeaders, validateRow } from './validators.ts';

export const processCSVContent = async (
  supabase: ReturnType<typeof createClient>,
  content: string,
  fileName: string
) => {
  console.log('Starting CSV processing...');
  
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    throw new Error('File is empty or contains only headers');
  }

  // Validate headers
  const headers = lines[0].split(',').map(h => h.trim());
  const headerValidation = validateCSVHeaders(headers);
  
  if (!headerValidation.isValid) {
    throw new Error(`Missing required headers: ${headerValidation.missingHeaders.join(', ')}`);
  }

  // Create import record
  const importId = crypto.randomUUID();
  const { error: importError } = await supabase
    .from('transaction_imports')
    .insert({
      id: importId,
      file_name: fileName,
      status: 'pending',
      records_processed: 0,
      auto_assigned: false
    });

  if (importError) {
    console.error('Error creating import record:', importError);
    throw importError;
  }

  console.log('Created import record with ID:', importId);

  // Process rows
  let validRows = 0;
  let totalAmount = 0;
  const errors: any[] = [];

  // Process rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map(v => v.trim());
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        rowData[header] = values[index];
      });

      // Validate row data
      const rowErrors = validateRow(rowData, i);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        continue;
      }

      // Store raw import data
      const { error: rawError } = await supabase
        .from('raw_transaction_imports')
        .insert({
          import_id: importId,
          raw_data: rowData,
          is_valid: true,
          payment_method: rowData.Payment_Method,
          payment_description: rowData.Description,
          license_plate: rowData.License_Plate,
          vehicle_details: rowData.Vehicle
        });

      if (rawError) {
        console.error('Error storing raw import:', rawError);
        errors.push({
          row: i,
          field: 'database',
          message: `Database error: ${rawError.message}`,
          data: rowData
        });
      } else {
        validRows++;
        totalAmount += Number(rowData.Amount);
      }
    } catch (error) {
      console.error(`Error processing row ${i}:`, error);
      errors.push({
        row: i,
        field: 'processing',
        message: `Processing error: ${error.message}`
      });
    }
  }

  // Update import record with results
  const { error: updateError } = await supabase
    .from('transaction_imports')
    .update({
      status: errors.length > 0 ? 'completed_with_errors' : 'completed',
      records_processed: validRows,
      errors: errors.length > 0 ? errors : null
    })
    .eq('id', importId);

  if (updateError) {
    console.error('Error updating import record:', updateError);
    throw updateError;
  }

  return {
    totalRows: lines.length - 1,
    validRows,
    invalidRows: errors.length,
    totalAmount,
    importId,
    errors: errors.length > 0 ? errors : null,
    suggestions: errors.length > 0 ? [
      'Review and correct invalid rows before proceeding',
      'Ensure all amounts are positive numbers',
      'Verify status values are one of: pending, completed, failed, refunded'
    ] : []
  };
};