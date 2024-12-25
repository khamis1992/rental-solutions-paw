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
  headers: string[],
  batchId: string
): TrafficFine[] => {
  console.log('Processing rows:', rows.length);
  
  const headerMap = headers.reduce((acc, header, index) => {
    acc[header.toLowerCase().trim()] = index;
    return acc;
  }, {} as Record<string, number>);

  console.log('Header mapping:', headerMap);

  return rows.map((row, index) => {
    console.log(`Processing row ${index + 1}:`, row);

    const fine_amount = parseFloat(row[headerMap['fine_amount']]);
    if (isNaN(fine_amount)) {
      throw new Error(`Invalid fine amount in row ${index + 1}: ${row[headerMap['fine_amount']]}`);
    }

    const violation_points = parseInt(row[headerMap['violation_points']], 10);
    if (isNaN(violation_points)) {
      throw new Error(`Invalid violation points in row ${index + 1}: ${row[headerMap['violation_points']]}`);
    }

    const violation_date = new Date(row[headerMap['violation_date']]);
    if (isNaN(violation_date.getTime())) {
      throw new Error(`Invalid date format in row ${index + 1}: ${row[headerMap['violation_date']]}`);
    }

    const fine: TrafficFine = {
      serial_number: row[headerMap['serial_number']],
      violation_number: row[headerMap['violation_number']],
      violation_date: violation_date.toISOString(),
      license_plate: row[headerMap['license_plate']],
      fine_location: row[headerMap['fine_location']],
      violation_charge: row[headerMap['violation_charge']],
      fine_amount,
      violation_points,
      import_batch_id: batchId
    };

    console.log(`Processed fine:`, fine);
    return fine;
  });
};

export const insertFines = async (
  supabase: ReturnType<typeof createClient>,
  fines: TrafficFine[]
): Promise<number> => {
  console.log('Inserting fines:', fines.length);
  
  const { error } = await supabase
    .from('traffic_fines')
    .insert(fines.map(fine => ({
      ...fine,
      payment_status: 'pending',
      assignment_status: 'pending'
    })));

  if (error) {
    console.error('Insert error:', error);
    throw error;
  }

  return fines.length;
};