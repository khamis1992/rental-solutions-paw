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
      
      // Create raw data array, filtering out empty lines
      const rows = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',');
          const row: Record<string, string> = {};
          
          // Handle cases where we might have more or fewer columns than headers
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || ''; // Use empty string for missing values
          });
          
          return row;
        });

      console.log('Sending payload to analyze-payment-import:', {
        totalRows: rows.length,
        sampleRow: rows[0]
      });
      
      // First, store raw data
      const { data: rawImport, error: rawError } = await supabase
        .from('raw_payment_imports')
        .insert([
          {
            raw_data: rows,
            is_valid: true
          }
        ])
        .select()
        .single();

      if (rawError) {
        console.error('Error storing raw import:', rawError);
        throw rawError;
      }

      // Then proceed with analysis
      const { data: analysis, error: analysisError } = await supabase.functions
        .invoke('analyze-payment-import', {
          body: { 
            fileContent,
            headers,
            rows,
            importId: rawImport.id,
            forceImport: true
          }
        });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        throw analysisError;
      }
      
      console.log('Analysis completed:', analysis);

      // Show summary toast with analysis results
      toast.info('File Analysis Complete', {
        description: `Found ${analysis.validRows?.length || 0} valid rows and ${analysis.invalidRows?.length || 0} invalid rows.`
      });

      if (analysis.invalidRows?.length > 0) {
        console.log('Invalid rows detected:', analysis.invalidRows);
      }

      setAnalysisResult({
        ...analysis,
        rows: rows // Include the original rows in the analysis result
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
      if (!analysisResult) {
        throw new Error('No analysis result available');
      }

      console.log('Implementing changes with payload:', {
        analysisResult
      });

      const { data, error } = await supabase.functions
        .invoke('process-payment-import', {
          body: { 
            analysisResult,
            forceImport: true
          }
        });

      if (error) {
        console.error('Implementation error:', error);
        throw error;
      }

      console.log('Import processing successful:', data);
      
      // Show detailed success message
      toast.success('Import Complete', {
        description: `Successfully processed ${data.processed} records${data.report?.failedBatches > 0 ? 
          `. ${data.report.failedBatches} batches failed.` : ''}`
      });

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