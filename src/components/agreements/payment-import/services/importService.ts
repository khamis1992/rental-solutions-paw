import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const uploadImportFile = async (file: File): Promise<string> => {
  const fileName = `payments/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("imports")
    .upload(fileName, file);

  if (uploadError) throw uploadError;
  return fileName;
};

export const createImportLog = async (fileName: string) => {
  const { error: logError } = await supabase
    .from("import_logs")
    .insert({
      file_name: fileName,
      import_type: 'payment',
      status: "pending",
    });

  if (logError) throw logError;
};

export const processImport = async (fileName: string) => {
  return await supabase.functions.invoke('process-payment-import', {
    body: { fileName }
  });
};

export const pollImportStatus = async (fileName: string) => {
  const { data: importLog, error } = await supabase
    .from("import_logs")
    .select("status, records_processed, errors")
    .eq("file_name", fileName)
    .single();

  if (error) throw error;
  return importLog;
};