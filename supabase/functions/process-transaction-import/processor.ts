import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { validateCSVStructure, validateRow } from './validators.ts';

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
  const headerValidation = validateCSVStructure(headers);
  
  if (!headerValidation.isValid) {
    throw new Error(`Missing required headers: ${headerValidation.missingHeaders.join(', ')}`);
  }

  // Create import record
  const { data: importRecord, error: importError } = await supabase.rpc(
    'create_transaction_import',
    { p_file_name: fileName }
  );

  if (importError) {
    console.error('Error creating import record:', importError);
    throw importError;
  }

  const importId = importRecord;
  console.log('Created import record with ID:', importId);

  // Process each row
  let validRows = 0;
  let invalidRows = 0;
  let totalAmount = 0;
  const errors = [];
  const processedRows = [];

  // Process rows (skip header)
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map(v => v.trim());
      
      // Validate row
      const validation = validateRow(values, headers, i);
      
      if (!validation.isValid) {
        invalidRows++;
        errors.push(...validation.errors);
        continue;
      }

      // Create row data object
      const rowData = headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as Record<string, string>);

      // Store raw import data
      const { error: rawError } = await supabase
        .from('raw_transaction_imports')
        .insert({
          import_id: importId,
          raw_data: rowData,
          is_valid: true
        });

      if (rawError) {
        console.error('Error storing raw import:', rawError);
        invalidRows++;
        errors.push({
          row: i,
          message: `Database error: ${rawError.message}`,
          data: rowData
        });
      } else {
        validRows++;
        const amount = parseFloat(rowData.Amount || '0');
        if (!isNaN(amount)) {
          totalAmount += amount;
        }
        processedRows.push(rowData);
      }
    } catch (error) {
      console.error(`Error processing row ${i}:`, error);
      invalidRows++;
      errors.push({
        row: i,
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
    invalidRows,
    totalAmount,
    errors: errors.length > 0 ? errors : null,
    suggestions: errors.length > 0 ? [
      'Review and correct invalid rows before proceeding',
      'Ensure all amounts are valid numbers',
      'Verify date format (DD-MM-YYYY) for all entries'
    ] : []
  };
};