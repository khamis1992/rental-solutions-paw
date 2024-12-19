import { supabase } from "@/integrations/supabase/client";
import { retryImportOperation } from "../utils/importUtils";

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
      import_type: "payments",
      status: "pending",
    });

  if (logError) throw logError;
};

export const processImport = async (fileName: string) => {
  return retryImportOperation(async () => {
    return supabase.functions.invoke('process-payment-import', {
      body: { fileName }
    });
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