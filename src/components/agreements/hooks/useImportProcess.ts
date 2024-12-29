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
      console.log('Implementing changes with analysis result:', analysisResult);

      // Extract the actual rows data from the analysis result
      const { data: rowsData } = await supabase.functions
        .invoke("analyze-payment-import", {
          body: { analysisResult },
          headers: {
            'Content-Type': 'application/json',
          }
        });

      if (!Array.isArray(rowsData)) {
        throw new Error('Invalid data format received from analysis');
      }

      const { error } = await supabase.functions
        .invoke("process-payment-import", {
          body: { 
            validRows: rowsData,
            totalRows: analysisResult.totalRows,
            totalAmount: analysisResult.totalAmount
          }
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