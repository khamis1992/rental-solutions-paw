import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAnalysisCard } from "./AIAnalysisCard";
import { FileUploadSection } from "./FileUploadSection";
import { useImportProcess } from "./hooks/useImportProcess";
import { ImportedTransactionsTable } from "./ImportedTransactionsTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TransactionType } from "../accounting/types/transaction.types";

export const TransactionImportTool = () => {
  const {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  } = useImportProcess();

  const queryClient = useQueryClient();

  const { data: importedTransactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["imported-transactions"],
    queryFn: async () => {
      console.log("Fetching imported transactions");
      const { data: transactions, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      console.log("Fetched transactions:", transactions);
      return transactions;
    }
  });

  const downloadTemplate = () => {
    const headers = [
      "type",
      "amount",
      "transaction_date",
      "description",
      "cost_type",
      "is_recurring"
    ].join(",");
    
    const sampleData = `${TransactionType.INCOME},1000.00,2024-03-20,Monthly Payment,fixed,false`;
    const csvContent = `${headers}\n${sampleData}`;
    
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      // First store the file in Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('imports')
        .upload(`transactions/${file.name}`, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload file');
        return;
      }

      // Parse CSV and insert into accounting_transactions
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          console.log("Parsed data:", results.data);
          
          // Insert each row into accounting_transactions
          for (const row of results.data) {
            const { data, error } = await supabase
              .from('accounting_transactions')
              .insert({
                type: row.type || TransactionType.INCOME,
                amount: parseFloat(row.amount) || 0,
                description: row.description,
                transaction_date: row.transaction_date || new Date().toISOString(),
                cost_type: row.cost_type,
                is_recurring: row.is_recurring === 'true'
              });

            if (error) {
              console.error('Insert error:', error);
              toast.error(`Failed to insert row: ${error.message}`);
            }
          }

          toast.success('Transactions imported successfully');
          queryClient.invalidateQueries({ queryKey: ["imported-transactions"] });
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          toast.error('Failed to parse CSV file');
        }
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import file');
    }
  };

  const handleImplementChanges = async () => {
    try {
      await implementChanges();
      await queryClient.invalidateQueries({ queryKey: ["imported-transactions"] });
      toast.success("Changes implemented successfully");
    } catch (error) {
      console.error("Implementation error:", error);
      toast.error("Failed to implement changes. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUploadSection
          onFileUpload={handleFileUpload}
          onDownloadTemplate={downloadTemplate}
          isUploading={isUploading}
          isAnalyzing={isAnalyzing}
        />
        
        {analysisResult && (
          <AIAnalysisCard
            analysisResult={analysisResult}
            onImplementChanges={handleImplementChanges}
            isUploading={isUploading}
          />
        )}

        {importedTransactions && importedTransactions.length > 0 && (
          <ImportedTransactionsTable transactions={importedTransactions} />
        )}
      </CardContent>
    </Card>
  );
};