import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FileUploadSection } from "./components/FileUploadSection";
import { ValidationSummary } from "./components/ValidationSummary";
import { ImportPreview } from "./components/ImportPreview";
import { validateImportData } from "./utils/importValidation";
import { supabase } from "@/integrations/supabase/client";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [skippedRows, setSkippedRows] = useState<Array<{ index: number; content: string; reason: string }>>([]);
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
      const { validRows, skippedRows } = validateImportData(text);
      
      setValidRows(validRows);
      setSkippedRows(skippedRows);

      // Create an import log entry
      const { data: importLog, error: importLogError } = await supabase
        .from('transaction_imports')
        .insert([{
          file_name: file.name,
          status: 'processing',
          records_processed: 0
        }])
        .select()
        .single();

      if (importLogError) throw importLogError;

      // Process all rows (both valid and invalid)
      const allRows = text.split('\n')
        .slice(1) // Skip header row
        .filter(line => line.trim().length > 0)
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const isValid = values.length === 9; // Check if row has correct number of columns
          
          return {
            raw_data: {
              line: line,
              values: values
            },
            error_description: isValid ? null : `Row has ${values.length} values but requires 9`,
            is_valid: isValid,
            import_id: importLog.id
          };
        });

      // Save all rows to raw_transaction_imports
      const { error: rawImportError } = await supabase
        .from('raw_transaction_imports')
        .insert(allRows);

      if (rawImportError) throw rawImportError;

      // Update import log status
      const { error: updateLogError } = await supabase
        .from('transaction_imports')
        .update({ 
          status: 'completed',
          records_processed: allRows.length
        })
        .eq('id', importLog.id);

      if (updateLogError) throw updateLogError;

      toast({
        title: "Import Complete",
        description: `Processed ${allRows.length} rows. ${validRows.length} valid, ${skippedRows.length} with errors.`,
      });
    } catch (error: any) {
      console.error('CSV processing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    }
  };

  const handleSaveTransactions = async () => {
    if (validRows.length === 0) {
      toast({
        title: "Error",
        description: "No valid data to import",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Prepare transactions for insert
      const transactions = validRows.map(row => ({
        transaction_date: new Date(row.transaction_date).toISOString(),
        amount: parseFloat(row.amount),
        description: row.description,
        type: parseFloat(row.amount) >= 0 ? 'income' : 'expense',
        status: 'pending'
      }));

      // Insert transactions
      const { error: transactionError } = await supabase
        .from('accounting_transactions')
        .insert(transactions);

      if (transactionError) throw transactionError;

      toast({
        title: "Success",
        description: `Successfully imported ${validRows.length} transactions.`,
      });
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      // Reset state
      setValidRows([]);
      setSkippedRows([]);
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to import transactions",
        variant: "destructive",
      });
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

  const downloadErrorLog = () => {
    const logContent = skippedRows
      .map(row => `Row ${row.index}: ${row.reason}\nContent: ${row.content}`)
      .join('\n\n');
    
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'import_errors.log');
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

      {skippedRows.length > 0 && (
        <ValidationSummary 
          skippedRows={skippedRows}
          onDownloadLog={downloadErrorLog}
        />
      )}

      {validRows.length > 0 && (
        <ImportPreview
          data={validRows}
          onImport={handleSaveTransactions}
          isImporting={isUploading}
        />
      )}
    </div>
  );
};