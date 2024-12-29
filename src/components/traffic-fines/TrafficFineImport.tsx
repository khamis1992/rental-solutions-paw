import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUploadSection } from "./components/FileUploadSection";
import { AIAnalysisCard } from "@/components/agreements/payment-import/AIAnalysisCard";
import { useImportProcess } from "@/components/agreements/hooks/useImportProcess";
import { TrafficFineFilters } from "./TrafficFineFilters";
import { TrafficFineTable } from "./TrafficFinesList";

export const TrafficFineImport = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<string>("violation_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const queryClient = useQueryClient();
  const { isUploading, isAnalyzing, analysisResult, startImport, implementChanges } = useImportProcess();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await startImport(file);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ["traffic-fines"] });
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "serial_number",
      "violation_number",
      "violation_date",
      "license_plate",
      "fine_location",
      "violation_charge",
      "fine_amount",
      "violation_points"
    ].join(",");
    
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "traffic_fines_import_template.csv");
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

      <TrafficFineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TrafficFineTable
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