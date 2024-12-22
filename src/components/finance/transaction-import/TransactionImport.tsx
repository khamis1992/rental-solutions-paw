import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TransactionPreviewTable } from "./TransactionPreviewTable";
import { parseCSV } from "./utils/csvUtils";

export const TransactionImport = () => {
  const [isUploading, setIsUploading] = useState(false);
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

    setIsUploading(true);
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      setPreviewData(parsedData);
      
      toast({
        title: "Success",
        description: "CSV file parsed successfully. Please review the transactions.",
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setIsUploading(true);
    try {
      const { data: importLog, error: createError } = await supabase
        .from('transaction_imports')
        .insert([{
          file_name: 'manual_import.csv',
          status: 'processing'
        }])
        .select()
        .single();

      if (createError) throw createError;

      const importItems = previewData.map((item, index) => ({
        import_id: importLog.id,
        transaction_date: item.date,
        amount: parseFloat(item.amount),
        description: item.description,
        customer_id: item.customer_id,
        category_id: item.category_id,
        row_number: index + 1
      }));

      const { error: itemsError } = await supabase
        .from('transaction_import_items')
        .insert(importItems);

      if (itemsError) throw itemsError;

      await queryClient.invalidateQueries({ queryKey: ['accounting-transactions'] });
      
      toast({
        title: "Success",
        description: `Successfully imported ${previewData.length} transactions`,
      });
      
      setPreviewData([]);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import transactions",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Date,Amount,Description,Category\n2024-03-20,1000.00,Monthly Revenue,Income";
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Import Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file to import multiple transactions at once
          </p>
        </div>
        <Button onClick={downloadTemplate} variant="outline">
          Download Template
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="w-[200px]"
            disabled={isUploading}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload className="h-4 w-4" />
              Upload CSV
            </label>
          </Button>

          {previewData.length > 0 && (
            <Button 
              onClick={handleImport}
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
          )}
        </div>

        {previewData.length > 0 && (
          <TransactionPreviewTable 
            data={previewData} 
            onDataChange={setPreviewData}
          />
        )}
      </div>
    </div>
  );
};