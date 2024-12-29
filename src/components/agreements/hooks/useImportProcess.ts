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

      // Make sure we have the rows data
      if (!analysisResult?.rows || !Array.isArray(analysisResult.rows)) {
        throw new Error('No valid rows data available');
      }

      // Format the rows data properly
      const formattedRows = analysisResult.rows.map((row: any) => ({
        lease_id: row.lease_id || null,
        customer_name: row.customer_name || '',
        amount: parseFloat(row.amount) || 0,
        license_plate: row.license_plate || '',
        vehicle: row.vehicle || '',
        payment_date: row.payment_date || null,
        payment_method: (row.payment_method || '').toLowerCase(),
        transaction_id: row.transaction_id || null,
        description: row.description || '',
        type: (row.type || '').toUpperCase(),
        status: (row.status || '').toLowerCase()
      }));

      console.log('Formatted rows for import:', formattedRows);

      // Process the valid rows
      const { data, error } = await supabase.functions
        .invoke("process-payment-import", {
          body: { rows: formattedRows }
        });

      if (error) {
        console.error('Import processing error:', error);
        throw error;
      }

      console.log('Import processing successful:', data);
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