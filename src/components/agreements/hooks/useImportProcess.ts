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

      // Format the rows data properly
      const formattedRows = analysisResult.rows.map((row: any) => {
        // Convert and validate each field
        const amount = typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount;
        if (isNaN(amount)) {
          throw new Error(`Invalid amount value: ${row.amount}`);
        }

        return {
          lease_id: row.lease_id || null,
          customer_name: String(row.customer_name || '').trim(),
          amount: amount,
          license_plate: String(row.license_plate || '').trim(),
          vehicle: String(row.vehicle || '').trim(),
          payment_date: row.payment_date || null,
          payment_method: String(row.payment_method || '').toLowerCase().trim(),
          transaction_id: row.transaction_id || null,
          description: String(row.description || '').trim(),
          type: String(row.type || '').toUpperCase().trim(),
          status: String(row.status || 'pending').toLowerCase().trim()
        };
      });

      console.log('Formatted rows for import:', formattedRows);

      if (formattedRows.length === 0) {
        throw new Error('No valid rows to import');
      }

      // Process the valid rows
      const { data, error } = await supabase.functions
        .invoke("process-payment-import", {
          body: { 
            rows: formattedRows,
            batchSize: 50
          }
        });

      if (error) {
        console.error('Import processing error:', error);
        throw error;
      }

      console.log('Import processing successful:', data);
      toast.success(`Successfully imported ${formattedRows.length} records`);
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