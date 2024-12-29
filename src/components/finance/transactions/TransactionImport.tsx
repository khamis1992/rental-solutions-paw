import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { TransactionFilters } from "./TransactionFilters";
import { TransactionTable } from "./TransactionTable";
import { FileUploadSection } from "./FileUploadSection";
import { AIAnalysisCard } from "@/components/agreements/payment-import/AIAnalysisCard";
import { useImportProcess } from "@/components/agreements/hooks/useImportProcess";

export const TransactionImport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("payment_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();
  const { isUploading, isAnalyzing, analysisResult, startImport, implementChanges } = useImportProcess();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await startImport(file);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV content
    const headers = [
      "amount",
      "payment_date",
      "payment_method",
      "status",
      "description",
      "transaction_id",
      "lease_id"
    ].join(",");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "transaction_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <FileUploadSection
        onFileUpload={handleFileUpload}
        onDownloadTemplate={handleDownloadTemplate}
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

      <TransactionFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TransactionTable
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={(field) => {
          if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
          } else {
            setSortField(field);
            setSortDirection("desc");
          }
        }}
      />
    </div>
  );
};