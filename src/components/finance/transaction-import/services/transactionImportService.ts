import { supabase } from "@/integrations/supabase/client";

export async function uploadImportFile(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('imports')
    .upload(fileName, file);

  if (uploadError) throw uploadError;
  return fileName;
}

export async function createImportLog(fileName: string) {
  const { error } = await supabase
    .from('transaction_imports')
    .insert([{ file_name: fileName }]);

  if (error) throw error;
}

export async function processImport(fileName: string) {
  return await supabase.functions.invoke('process-transaction-import', {
    body: { fileName }
  });
}

export async function pollImportStatus(fileName: string) {
  const { data, error } = await supabase
    .from('transaction_imports')
    .select('*')
    .eq('file_name', fileName)
    .single();

  if (error) throw error;
  return data;
}