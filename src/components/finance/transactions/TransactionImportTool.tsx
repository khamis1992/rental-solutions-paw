import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { ImportedTransactionsTable } from "./ImportedTransactionsTable";
import { useImportProcess } from "./hooks/useImportProcess";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountingTransaction } from "../types/transaction.types";
import Papa from 'papaparse';

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
      const { data: transactions, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return transactions as AccountingTransaction[];
    }
  });

  const downloadTemplate = () => {
    const headers = [
      "type",
      "amount",
      "transaction_date",
      "description",
      "payment_method",
      "status"
    ].join(",");
    
    const sampleData = `INCOME,1000.00,2024-03-20,Monthly Payment,credit_card,completed`;
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
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const transformedData = results.data.map((row: any) => ({
            type: row.type || 'INCOME',
            amount: String(row.amount || '0'),
            description: row.description,
            transaction_date: row.transaction_date,
            payment_method: row.payment_method,
            status: row.status || 'pending'
          }));

          const { error } = await supabase
            .from('accounting_transactions')
            .insert(transformedData);

          if (error) {
            console.error('Insert error:', error);
            toast.error(`Failed to insert data: ${error.message}`);
          } else {
            toast.success('Transactions imported successfully');
            queryClient.invalidateQueries({ queryKey: ["imported-transactions"] });
          }
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
        
        {importedTransactions && importedTransactions.length > 0 && (
          <ImportedTransactionsTable transactions={importedTransactions} />
        )}
      </CardContent>
    </Card>
  );
};