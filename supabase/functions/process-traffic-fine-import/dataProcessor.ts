import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { ValidationError } from './validators.ts';

interface ProcessedData {
  success: boolean;
  processed?: number;
  errors?: ValidationError[];
  error?: string;
}

export const processCSVContent = (
  content: string,
  expectedColumns: number
): { headers: string[]; rows: string[][] } => {
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));

  return { headers, rows };
};

export const insertTrafficFines = async (
  supabase: ReturnType<typeof createClient>,
  fines: any[],
  errors: ValidationError[]
): Promise<ProcessedData> => {
  if (fines.length === 0) {
    return {
      success: false,
      error: 'No valid records found to import',
      errors
    };
  }

  // Insert fines in batches of 100 to avoid potential payload size limits
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < fines.length; i += batchSize) {
    const batch = fines.slice(i, i + batchSize);
    batches.push(batch);
  }

  let insertedCount = 0;
  const insertErrors = [];

  for (const batch of batches) {
    const { error: insertError, data } = await supabase
      .from('traffic_fines')
      .insert(batch)
      .select();

    if (insertError) {
      console.error('Database insertion error:', insertError);
      insertErrors.push(insertError.message);
    } else {
      insertedCount += data?.length || 0;
    }
  }

  if (insertErrors.length > 0) {
    return {
      success: false,
      error: `Failed to insert some fines: ${insertErrors.join(', ')}`,
      errors: [...errors, ...insertErrors.map((error, index) => ({
        row: -1,
        error,
        data: `Batch insert error ${index + 1}`
      }))]
    };
  }

  // Log import results
  const { error: logError } = await supabase
    .from('traffic_fine_imports')
    .insert({
      file_name: 'import_file',
      total_fines: fines.length,
      unassigned_fines: fines.length,
      processed_by: null,
      import_errors: errors.length > 0 ? errors : null,
    });

  if (logError) {
    console.error('Error logging import:', logError);
  }

  return {
    success: true,
    processed: insertedCount,
    errors: errors.length > 0 ? errors : undefined
  };
};