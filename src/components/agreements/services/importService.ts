import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const analyzeImportFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data: aiAnalysis, error: analysisError } = await supabase.functions
    .invoke('analyze-payment-import', {
      body: formData,
    });

  if (analysisError) throw analysisError;
  return aiAnalysis;
};

export const processImportFile = async (file: File, fileName: string) => {
  console.log('Starting file upload process...');
  
  const { error: uploadError } = await supabase.storage
    .from("imports")
    .upload(fileName, file);

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw uploadError;
  }

  console.log('File uploaded successfully:', fileName);
};

export const createImportLog = async (fileName: string) => {
  const { error: logError } = await supabase
    .from("import_logs")
    .insert({
      file_name: fileName,
      import_type: "payments",
      status: "pending",
    });

  if (logError) {
    console.error('Import log creation error:', logError);
    throw logError;
  }
};

export const pollImportStatus = async (fileName: string) => {
  const { data: importLog, error } = await supabase
    .from("import_logs")
    .select("*")
    .eq("file_name", fileName)
    .single();

  if (error) throw error;
  return importLog;
};