import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeImportFile, processImportFile } from "../services/importService";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      // Analyze the file first
      const analysis = await analyzeImportFile(file);
      console.log('File analysis completed:', analysis);
      
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
      console.log('Starting implementation with analysis result:', analysisResult);

      if (!analysisResult?.rows || !Array.isArray(analysisResult.rows)) {
        throw new Error('Invalid data format: rows must be an array');
      }

      const { data, error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { analysisResult }
        });

      if (error) {
        console.error('Import processing error:', error);
        throw error;
      }

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