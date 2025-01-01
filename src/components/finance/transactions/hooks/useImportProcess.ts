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
      setAnalysisResult(aiAnalysis);

      // If analysis successful, process the import
      if (aiAnalysis.success) {
        const { data: importResult, error: importError } = await supabase.functions
          .invoke('process-payment-import', {
            body: { 
              fileName: aiAnalysis.fileName,
              processedFileUrl: aiAnalysis.processedFileUrl
            }
          });

        if (importError) {
          console.error('Import error:', importError);
          toast.error(importError.message || "Failed to import file");
          return false;
        }

        console.log('Import successful:', importResult);
        toast.success("Transactions imported successfully");
        
        // Refresh the transactions data
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
        
        return true;
      }

      return false;
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
    if (!analysisResult) return;

    setIsUploading(true);
    try {
      console.log('Implementing changes...');
      const { error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { analysisResult }
        });

      if (error) throw error;

      toast.success("Changes implemented successfully");
      setAnalysisResult(null);
      
      // Refresh the transactions data
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
      
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