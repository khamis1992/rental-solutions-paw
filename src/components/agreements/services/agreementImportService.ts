import { supabase } from "@/integrations/supabase/client";
import { retryOperation } from "../utils/retryUtils";

export const createAgreement = async (agreementData: any) => {
  const { data, error } = await supabase
    .from("leases")
    .insert({
      customer_id: agreementData.customer_id,
      vehicle_id: agreementData.vehicle_id,
      start_date: agreementData.start_date,
      end_date: agreementData.end_date,
      total_amount: agreementData.total_amount,
      agreement_number: agreementData.agreement_number,
      status: agreementData.status || 'pending_payment',
      initial_mileage: 0 // Adding the required field with a default value
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadImportFile = async (file: File) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from("imports")
    .upload(fileName, file);

  if (uploadError) throw uploadError;
  return fileName;
};

export const processImport = async (fileName: string) => {
  return retryOperation(
    () => supabase.functions.invoke('process-agreement-import', {
      body: { fileName }
    }),
    3,
    1000
  );
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

export const pollImportStatus = async (fileName: string) => {
  const { data: importLog } = await supabase
    .from("import_logs")
    .select("status, records_processed, errors")
    .eq("file_name", fileName)
    .single();

  return importLog;
};