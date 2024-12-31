import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ValidationError {
  row: number;
  message: string;
  data?: any;
}

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
      'amount',
      'payment_date',
      'payment_method',
      'status',
      'description',
      'transaction_id',
      'lease_id'
    ];

    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
      return false;
    }

    // Validate data format in each row
    const headerIndexes = requiredHeaders.reduce((acc, header) => {
      acc[header] = headers.indexOf(header);
      return acc;
    }, {} as Record<string, number>);

    let hasErrors = false;
    lines.slice(1).forEach((line, index) => {
      const values = line.split(',').map(v => v.trim());
      
      // Validate amount format
      const amount = values[headerIndexes.amount];
      if (amount && isNaN(parseFloat(amount))) {
        toast.error(`Row ${index + 2}: Invalid amount format - ${amount}`);
        hasErrors = true;
      }

      // Validate date format
      const date = values[headerIndexes.payment_date];
      if (date && !isValidDate(date)) {
        toast.error(`Row ${index + 2}: Invalid date format - use YYYY-MM-DD`);
        hasErrors = true;
      }

      // Validate required fields are not empty
      requiredHeaders.forEach(header => {
        const value = values[headerIndexes[header]];
        if (!value || value.trim() === '') {
          toast.error(`Row ${index + 2}: Missing required field - ${header}`);
          hasErrors = true;
        }
      });
    });

    return !hasErrors;
  } catch (error) {
    console.error("CSV validation error:", error);
    toast.error("Error validating CSV file");
    return false;
  }
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

export const useImportProcess = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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
      
      console.log('Starting file upload...');

      // Create the payload as JSON
      const payload = {
        fileName: file.name,
        fileContent: fileContent
      };

      console.log('Sending payload to Edge Function:', {
        fileName: payload.fileName,
        contentLength: payload.fileContent.length
      });

      // Call Edge Function with JSON payload
      const { data, error } = await supabase.functions.invoke('process-payment-import', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      console.log('Edge Function response:', data);
      
      if (!data || !data.totalRows || !data.validRows) {
        throw new Error('Invalid response format from server');
      }

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
      if (!analysisResult) {
        throw new Error('No analysis result available');
      }

      const { error } = await supabase.functions.invoke('process-payment-import', {
        body: { 
          analysisResult,
          action: 'implement'
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (error) throw error;

      toast.success("Payments imported successfully");
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