import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      console.log('Starting file analysis with AI...');
      
      // First, analyze with AI
      const formData = new FormData();
      formData.append('file', file);
      
      const { data: aiAnalysis, error: analysisError } = await supabase.functions
        .invoke('analyze-transaction-import', {
          body: formData,
        });

      if (analysisError) {
        console.error('AI Analysis error:', analysisError);
        toast.error(analysisError.message || "Failed to analyze file");
        return false;
      }

      console.log('AI Analysis complete:', aiAnalysis);

      // Transform the analysis result to match expected structure
      const transformedAnalysis = {
        success: aiAnalysis.success,
        totalRows: aiAnalysis.totalRows,
        validRows: aiAnalysis.validRows,
        invalidRows: aiAnalysis.invalidRows,
        totalAmount: aiAnalysis.totalAmount,
        rawData: [], // Will be populated from the CSV
        issues: aiAnalysis.issues || [],
        suggestions: aiAnalysis.suggestions || []
      };

      // Parse the CSV content to get raw data
      const response = await fetch(aiAnalysis.processedFileUrl);
      const csvContent = await response.text();
      const lines = csvContent.split('\n');
      const headers = lines[0].split(',');
      const rawData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
            return obj;
          }, {} as Record<string, string>);
        });

      transformedAnalysis.rawData = rawData;
      setAnalysisResult(transformedAnalysis);
      
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

      // Success message and data refresh will be handled by the parent component
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