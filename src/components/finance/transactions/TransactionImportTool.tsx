import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadSection } from "./FileUploadSection";
import { ImportedTransactionsTable } from "./ImportedTransactionsTable";
import { useImportProcess } from "./hooks/useImportProcess";
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

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["accounting-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_transactions")
        .select("*")
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }

      return data as AccountingTransaction[];
    }
  });

  const downloadTemplate = () => {
    const headers = [
      "Amount",
      "Transaction_Date",
      "Payment_Method",
      "Status",
      "Description",
      "Transaction_ID",
      "Agreement_Number"
    ].join(",");
    
    const sampleData = "1000,2024-03-20,credit_card,completed,Monthly Payment,INV001,AGR-202403-0001";
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
            amount: row.Amount,
            transaction_date: row.Transaction_Date,
            payment_method: row.Payment_Method,
            status: row.Status,
            description: row.Description,
            transaction_id: row.Transaction_ID,
            agreement_number: row.Agreement_Number
          }));

          const { error } = await supabase
            .from('accounting_transactions')
            .insert(transformedData);

          if (error) {
            console.error('Insert error:', error);
            toast.error(`Failed to insert data: ${error.message}`);
          } else {
            toast.success('Transactions imported successfully');
            queryClient.invalidateQueries({ queryKey: ["accounting-transactions"] });
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
        
        {transactions && transactions.length > 0 && (
          <ImportedTransactionsTable transactions={transactions} />
        )}
      </CardContent>
    </Card>
  );
};