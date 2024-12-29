import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIAnalysisCard } from "@/components/finance/transactions/AIAnalysisCard";
import { FileUploadSection } from "@/components/finance/transactions/FileUploadSection";
import { useImportProcess } from "@/components/finance/transactions/hooks/useImportProcess";

export const TransactionImportTool = () => {
  const {
    isUploading,
    isAnalyzing,
    analysisResult,
    startImport,
    implementChanges
  } = useImportProcess();

  const downloadTemplate = () => {
    const headers = [
      "Lease_ID",
      "Customer_Name",
      "Amount",
      "License_Plate",
      "Vehicle",
      "Payment_Date",
      "Payment_Method",
      "Transaction_ID",
      "Description",
      "Type",
      "Status"
    ].join(",");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await startImport(file);
    if (!success) {
      event.target.value = '';
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
            onImplementChanges={implementChanges}
            isUploading={isUploading}
          />
        )}
      </CardContent>
    </Card>
  );
};