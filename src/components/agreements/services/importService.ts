import { supabase } from "@/integrations/supabase/client";

export const analyzeImportFile = async (file: File) => {
  console.log('Starting file analysis...');
  const formData = new FormData();
  formData.append('file', file);
  
  const { data: aiAnalysis, error: analysisError } = await supabase.functions
    .invoke('analyze-payment-import', {
      body: formData,
    });

  if (analysisError) {
    console.error('Analysis error:', analysisError);
    throw analysisError;
  }
  
  console.log('Analysis completed:', aiAnalysis);
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
  
  // Process the file using Edge Function
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  
  const { error: processError } = await supabase.functions
    .invoke('process-payment-import', {
      body: formData
    });

  if (processError) {
    console.error('Processing error:', processError);
    throw processError;
  }
};

export const createImportLog = async (fileName: string) => {
  console.log('Creating import log...');
  
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
  
  console.log('Import log created successfully');
};

export const pollImportStatus = async (fileName: string) => {
  console.log('Polling import status for:', fileName);
  
  const { data: importLog, error } = await supabase
    .from("import_logs")
    .select("*")
    .eq("file_name", fileName)
    .single();

  if (error) {
    console.error('Poll status error:', error);
    throw error;
  }
  
  console.log('Import status:', importLog);
  return importLog;
};