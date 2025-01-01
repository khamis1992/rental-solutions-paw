import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const validateCSVFile = async (file: File): Promise<boolean> => {
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxFileSize) {
    toast.error("File size must be less than 10MB");
    return false;
  }

  if (!file.name.toLowerCase().endsWith('.csv')) {
    toast.error("Please upload a CSV file");
    return false;
  }

  try {
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      toast.error("File is empty or contains only headers");
      return false;
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredHeaders = [
      'lease_id',
      'customer_name',
      'amount',
      'license_plate',
      'vehicle',
      'payment_date',
      'payment_method',
      'transaction_id',
      'description',
      'type',
      'status'
    ];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("CSV validation error:", error);
    toast.error("Error validating CSV file");
    return false;
  }
};

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const startImport = async (file: File) => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      const isValid = await validateCSVFile(file);
      if (!isValid) {
        setIsUploading(false);
        setIsAnalyzing(false);
        return false;
      }

      const fileContent = await file.text();
      const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

      const payload = {
        fileName: file.name,
        fileContent: fileContent,
        headers: headers,
        totalRows: lines.length - 1
      };

      console.log('Starting file upload with payload:', {
        ...payload,
        fileContentLength: fileContent.length
      });

      const { data, error } = await supabase.functions
        .invoke('process-transaction-import', {
          body: payload
        });

      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      console.log('Edge Function response:', data);
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
      const { error } = await supabase.functions
        .invoke("process-payment-import", {
          body: { analysisResult }
        });

      if (error) throw error;

      toast.success("Transactions imported successfully");
      setAnalysisResult(null);
      // Refresh the transactions list
      queryClient.invalidateQueries({ queryKey: ['imported-transactions'] });
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