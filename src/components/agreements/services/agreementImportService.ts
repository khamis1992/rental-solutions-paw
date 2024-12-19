import { supabase } from "@/integrations/supabase/client";

export const createAgreement = async (agreementData: any) => {
  try {
    console.log('Creating agreement with data:', agreementData);
    
    // Get first available vehicle for testing/development
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('id')
      .eq('status', 'available')
      .limit(1)
      .single();

    if (!vehicle) {
      throw new Error('No available vehicle found');
    }
    
    const { data, error } = await supabase
      .from('leases')
      .insert({
        agreement_number: agreementData['Agreement Number'],
        license_no: agreementData['License Plate'],
        customer_id: agreementData['Customer ID'], // This should be mapped to an existing customer
        license_number: agreementData['License Number'],
        start_date: agreementData['Start Date'],
        end_date: agreementData['End Date'],
        return_date: agreementData['Return Date'],
        status: agreementData['STATUS']?.toLowerCase(),
        total_amount: 0, // Default value, should be updated based on your business logic
        initial_mileage: 0, // Default value, should be updated based on your business logic
        vehicle_id: vehicle.id, // Required field
        agreement_type: 'short_term' // Default value
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }

    console.log('Agreement created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createAgreement:', error);
    throw error;
  }
};

export const uploadImportFile = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from("imports")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) throw uploadError;
  return fileName;
};

export const createImportLog = async (fileName: string) => {
  const { error: logError } = await supabase
    .from("import_logs")
    .insert({
      file_name: fileName,
      import_type: "agreements",
      status: "pending",
    });

  if (logError) throw logError;
};

export const processImport = async (fileName: string) => {
  return supabase.functions.invoke('process-agreement-import', {
    body: { fileName }
  });
};

export const pollImportStatus = async (fileName: string) => {
  const { data: importLog } = await supabase
    .from("import_logs")
    .select("status, records_processed, errors")
    .eq("file_name", fileName)
    .single();

  return importLog;
};