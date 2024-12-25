import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export const downloadFile = async (
  supabase: ReturnType<typeof createClient>,
  fileName: string
): Promise<string> => {
  console.log('Downloading file:', fileName);
  
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('imports')
    .download(fileName);

  if (downloadError) {
    console.error('Download error:', downloadError);
    throw new Error(`Failed to download file: ${downloadError.message}`);
  }

  return await fileData.text();
};

export const parseCSVContent = (content: string): string[][] => {
  console.log('Parsing CSV content');
  
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  return lines.map(line => {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }
      
      if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    
    values.push(currentValue.trim());
    return values.filter(Boolean);
  });
};