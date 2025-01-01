import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PaymentImportData, PaymentAnalysisResult } from "../types/payment.types";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PaymentAnalysisResult | null>(null);
  const queryClient = useQueryClient();

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      console.log('Starting file analysis...');
      
      // First read the file content as text
      const fileContent = await file.text();
      console.log('File content length:', fileContent.length);
      
      // Create FormData with validated content
      const formData = new FormData();
      formData.append('file', new Blob([fileContent], { type: 'text/csv' }));
      
      const { data: aiAnalysis, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: formData,
        });

      if (analysisError) {
        console.error('AI Analysis error:', analysisError);
        toast.error(analysisError.message || "Failed to analyze file");
        return false;
      }

      console.log('AI Analysis complete:', aiAnalysis);
      setAnalysisResult(aiAnalysis);
      return true;
    } catch (error: any) {
      console.error("Import process error:", error);
      toast.error(error.message || "Failed to process import");
      return false;
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  const implementChanges = async () => {
    if (!analysisResult) {
      toast.error("No analysis result available");
      return;
    }

    setIsUploading(true);
    try {
      console.log('Implementing changes with analysis result:', analysisResult);
      
      const { error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { analysisResult }
        });

      if (error) throw error;
      
      // Wait for the database to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await queryClient.invalidateQueries({ queryKey: ["imported-transactions"] });
      setAnalysisResult(null);
      toast.success("Changes implemented successfully");
      
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