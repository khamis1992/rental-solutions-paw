import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export const insertTrafficFine = async (
  supabase: ReturnType<typeof createClient>,
  fine: {
    serial_number: string;
    violation_number: string;
    violation_date: string;
    license_plate: string;
    fine_location: string;
    violation_charge: string;
    fine_amount: number;
    violation_points: number;
  }
) => {
  const { error: insertError } = await supabase
    .from('traffic_fines')
    .insert([{
      ...fine,
      assignment_status: 'pending',
      payment_status: 'pending'
    }]);

  if (insertError) {
    console.error('Error inserting fine:', insertError);
    throw insertError;
  }
}

export const logImport = async (
  supabase: ReturnType<typeof createClient>,
  fileName: string,
  processed: number,
  errors: any[]
) => {
  const { error: logError } = await supabase
    .from('traffic_fine_imports')
    .insert([{
      file_name: fileName,
      total_fines: processed,
      unassigned_fines: processed,
      import_errors: errors.length > 0 ? errors : null
    }]);

  if (logError) {
    console.error('Error logging import:', logError);
    throw logError;
  }
}