import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      console.log('Starting file upload...');
      const fileContent = await file.text();
      
      const { data, error } = await supabase.functions.invoke('process-transaction-import', {
        body: {
          fileName: file.name,
          fileContent: fileContent
        }
      });

      if (error) {
        console.error('Import error:', error);
        toast.error(error.message || "Failed to import file");
        return false;
      }

      console.log('Import response:', data);
      setAnalysisResult(data);
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
      
      // Invalidate and refetch transactions query
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