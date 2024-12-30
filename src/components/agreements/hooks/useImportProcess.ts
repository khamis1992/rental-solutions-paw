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
          const row: Record<string, string> = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          return row;
        });

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
        throw rawError;
      }

      // Directly process the data without validation
      const { data, error: processError } = await supabase.functions
        .invoke('process-payment-import', {
          body: { 
            rows,
            importId: rawImport.id,
            skipValidation: true
          }
        });

      if (processError) {
        throw processError;
      }

      toast.success('Import Complete', {
        description: `Successfully processed ${data.processed} records`
      });

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
