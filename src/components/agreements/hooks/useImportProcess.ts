import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const startImport = async (file: File) => {
    setIsUploading(true);
    try {
      // Read file content
      const fileContent = await file.text();
      const lines = fileContent.split('\n').map(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Create raw data array, filtering out empty lines
      const rows = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          if (values.length !== headers.length) {
            console.warn('Invalid column count:', { 
              expected: headers.length, 
              got: values.length, 
              line 
            });
            return null;
          }
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          return row;
        })
        .filter((row): row is Record<string, string> => row !== null);

      console.log('Processed rows:', { total: rows.length, headers });

      if (rows.length === 0) {
        throw new Error('No valid rows found in the file');
      }

      // Store raw data directly
      const { data: rawImport, error: rawError } = await supabase
        .from('raw_payment_imports')
        .insert([
          {
            raw_data: rows,
            is_valid: true
          }
        ])
        .select()
        .single();

      if (rawError) {
        console.error('Raw import error:', rawError);
        throw rawError;
      }

      // Process the data - ensure we're sending an array
      console.log('Sending to edge function:', { rows, importId: rawImport.id });
      
      const { data, error: processError } = await supabase.functions
        .invoke('process-payment-import', {
          body: { 
            rows: Array.isArray(rows) ? rows : [],
            importId: rawImport.id,
            skipValidation: true
          }
        });

      if (processError) {
        console.error('Process error:', processError);
        throw processError;
      }

      console.log('Import response:', data);

      // Show appropriate toast message
      if (data.errors && data.errors.length > 0) {
        toast.warning(`Imported ${data.processed} records with ${data.errors.length} errors`, {
          description: 'Some records could not be processed. Check the console for details.'
        });
      } else {
        toast.success('Import Complete', {
          description: `Successfully processed ${data.processed} records`
        });
      }

      return true;
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import file");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges: () => {} // Kept for compatibility
  };
};