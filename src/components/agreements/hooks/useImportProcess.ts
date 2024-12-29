import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const startImport = async (file: File) => {
    setIsUploading(true);
    try {
      // Upload file to Supabase storage
      const fileName = `${crypto.randomUUID()}.csv`;
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Start analysis
      setIsAnalyzing(true);
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke("analyze-payment-import", {
          body: { fileName },
        });

      if (analysisError) throw analysisError;
      setAnalysisResult(analysisData);

      // Start import process
      const { data: importData, error: importError } = await supabase.functions
        .invoke("process-payment-import", {
          body: { fileName },
        });

      if (importError) throw importError;

      // Poll for import status
      const importId = importData.importId;
      await pollImportStatus(importId);

      toast.success("Import completed successfully");
      return true;
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import file");
      return false;
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const pollImportStatus = async (importId: string) => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 30;
      const pollInterval = setInterval(async () => {
        try {
          attempts++;
          const { data: importStatus, error: statusError } = await supabase
            .from("import_logs")
            .select("*")
            .eq("id", importId)
            .single();

          if (statusError) throw statusError;

          if (importStatus?.status === "completed") {
            clearInterval(pollInterval);
            resolve(true);
          } else if (importStatus?.status === "error") {
            clearInterval(pollInterval);
            throw new Error(importStatus.errors ? JSON.stringify(importStatus.errors) : "Import failed");
          }

          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            throw new Error("Import timed out");
          }
        } catch (error) {
          console.error('Polling error:', error);
          clearInterval(pollInterval);
          reject(error);
        }
      }, 2000);
    });
  };

  return {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
  };
};