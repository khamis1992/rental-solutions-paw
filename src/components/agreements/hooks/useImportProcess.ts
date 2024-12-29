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

        const rentAmount = typeof row.rent_amount === 'string' ? parseFloat(row.rent_amount) : row.rent_amount;
        const finalPrice = typeof row.final_price === 'string' ? parseFloat(row.final_price) : row.final_price;
        const amountPaid = typeof row.amount_paid === 'string' ? parseFloat(row.amount_paid) : row.amount_paid;
        const remainingAmount = typeof row.remaining_amount === 'string' ? parseFloat(row.remaining_amount) : row.remaining_amount;

        if (isNaN(rentAmount) || isNaN(finalPrice) || isNaN(amountPaid) || isNaN(remainingAmount)) {
          throw new Error('Invalid numeric values in the data');
        }

        return {
          agreement_number: String(row.agreement_number || '').trim(),
          license_plate: String(row.license_plate || '').trim(),
          rent_amount: rentAmount,
          final_price: finalPrice,
          amount_paid: amountPaid,
          remaining_amount: remainingAmount,
          agreement_duration: row.agreement_duration || null,
          import_status: 'pending'
        };
      });

      console.log('Formatted rows for import:', formattedRows);

      if (formattedRows.length === 0) {
        throw new Error('No valid rows to import');
      }

      // Process the valid rows
      const { data, error } = await supabase
        .from('remaining_amounts')
        .insert(formattedRows)
        .select();

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