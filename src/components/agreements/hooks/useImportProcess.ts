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
      // Read file content
      const fileContent = await file.text();
      const lines = fileContent.split('\n').map(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Send raw data for analysis
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: { 
            fileContent,
            headers,
            totalRows: lines.length - 1
          }
        });

      if (analysisError) throw analysisError;
      
      console.log('Analysis completed:', analysis);
      setAnalysisResult(analysis);
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
      if (!analysisResult) {
        throw new Error('No analysis result available');
      }

      const { data, error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { analysisResult }
        });

      if (error) throw error;

      console.log('Import processing successful:', data);
      toast.success(`Successfully imported ${data.processed} records`);
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