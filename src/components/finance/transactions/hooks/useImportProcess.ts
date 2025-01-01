import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      console.log('Starting file upload...');
      const fileContent = await file.text();
      const lines = fileContent.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const rawData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, any> = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        return row;
      });

      const { data, error } = await supabase.functions.invoke('process-transaction-import', {
        body: {
          fileName: file.name,
          fileContent: fileContent,
          rawData
        }
      });

      if (error) {
        console.error('Import error:', error);
        toast.error(error.message || "Failed to import file");
        return false;
      }

      console.log('Import response:', data);
      setAnalysisResult({
        ...data,
        rawData
      });
      return true;
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import file");
      return false;
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  const implementChanges = async () => {
    setIsUploading(true);
    try {
      console.log('Implementing changes...');
      const { error } = await supabase.functions.invoke("process-payment-import", {
        body: { analysisResult }
      });

      if (error) throw error;

      toast.success("Transactions imported successfully");
      setAnalysisResult(null);
    } catch (error: any) {
      console.error("Implementation error:", error);
      toast.error(error.message || "Failed to implement changes");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  };
};