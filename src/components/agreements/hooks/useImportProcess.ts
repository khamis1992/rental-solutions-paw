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
      
      // Create raw data array
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {} as Record<string, string>);
      });

      // Log the payload for debugging
      console.log('Sending payload to analyze-payment-import:', {
        fileContent,
        headers,
        totalRows: lines.length - 1,
        rows
      });
      
      // Send raw data for analysis
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: { 
            fileContent,
            headers,
            totalRows: lines.length - 1,
            rows
          }
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }
      
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
      if (!analysisResult?.validRows || !Array.isArray(analysisResult.validRows)) {
        throw new Error('Invalid analysis result: validRows must be an array');
      }

      console.log('Implementing changes with payload:', {
        analysisResult
      });

      const { data, error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { analysisResult }
        });

      if (error) {
        console.error('Implementation error:', error);
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