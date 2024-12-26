import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { FileUploadSection } from "./components/FileUploadSection";
import { ValidationErrorDisplay } from "./components/ValidationErrorDisplay";
import { Button } from "@/components/ui/button";
import { validateAndRepairCSV, displayValidationErrors } from "./utils/csvValidation";
import { parseCSV } from "./utils/csvUtils";
import { supabase } from "@/integrations/supabase/client";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Array<{ row: number; message: string; content?: string }>>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const expectedColumns = 9; // Update this based on your requirements
      
      // Validate and repair CSV content
      const { isValid, repairedData, errors } = validateAndRepairCSV(text, expectedColumns);
      
      if (errors) {
        setValidationErrors(errors);
        displayValidationErrors(errors);
        
        if (!isValid) {
          return;
        }
      }

      if (!repairedData) {
        toast.error("Failed to process CSV file");
        return;
      }

      // Parse the repaired data
      const parsedData = parseCSV(repairedData.join('\n'));
      setPreviewData(parsedData);
      
      toast.success(`Successfully parsed ${parsedData.length} transactions.`);
    } catch (error: any) {
      console.error('CSV processing error:', error);
      toast.error(error.message || "Failed to process CSV file");
    }
  };

  const handleSaveTransactions = async () => {
    if (previewData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setIsUploading(true);
    try {
      const { error } = await supabase
        .from('accounting_transactions')
        .insert(previewData.map(row => ({
          transaction_date: row.transaction_date,
          amount: row.amount,
          description: row.description,
          type: parseFloat(row.amount) >= 0 ? 'income' : 'expense',
          status: 'pending'
        })));

      if (error) throw error;

      toast.success(`Successfully imported ${previewData.length} transactions.`);
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setPreviewData([]);
      setValidationErrors([]);
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import transactions");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Transaction_Date,Amount,Description,Category,Payment_Method,Reference_Number,Status,Notes,Tags\n" +
                      "2024-03-20,1000.00,Monthly Revenue,Income,bank_transfer,REF001,completed,Regular payment,revenue";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transaction_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={downloadTemplate}
        isUploading={isUploading}
      />

      {validationErrors.length > 0 && (
        <ValidationErrorDisplay errors={validationErrors} />
      )}

      {previewData.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveTransactions}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Transactions'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};