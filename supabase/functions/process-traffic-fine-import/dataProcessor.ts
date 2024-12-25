import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export interface TrafficFine {
  serial_number: string;
  violation_number: string;
  violation_date: string;
  license_plate: string;
  fine_location: string;
  violation_charge: string;
  fine_amount: number;
  violation_points: number;
  import_batch_id: string;
}

export const processRows = (
  rows: string[][],
  batchId: string
): TrafficFine[] => {
  console.log('Processing rows:', rows.length);
  
  const [headers, ...dataRows] = rows;
  const headerMap = headers.reduce((acc, header, index) => {
    acc[header.toLowerCase().trim()] = index;
    return acc;
  }, {} as Record<string, number>);

  return dataRows.map((row) => ({
    serial_number: row[headerMap['serial_number']],
    violation_number: row[headerMap['violation_number']],
    violation_date: row[headerMap['violation_date']],
    license_plate: row[headerMap['license_plate']],
    fine_location: row[headerMap['fine_location']],
    violation_charge: row[headerMap['violation_charge']],
    fine_amount: Number(row[headerMap['fine_amount']]),
    violation_points: Number(row[headerMap['violation_points']]),
    import_batch_id: batchId
  }));
};

export const insertFines = async (
  supabase: ReturnType<typeof createClient>,
  fines: TrafficFine[]
): Promise<number> => {
  console.log('Inserting fines:', fines.length);
  
  const { error } = await supabase
    .from('traffic_fines')
    .insert(fines);

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  return fines.length;
};