import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileUploadSection } from "./components/FileUploadSection";
import { TrafficFineFilters } from "./TrafficFineFilters";
import { TrafficFinesList } from "./TrafficFinesList";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the import using Edge Function
      const { data, error: processError } = await supabase.functions
        .invoke("process-raw-traffic-fine-import", {
          body: { fileName }
        });

      if (processError) throw processError;

      if (data.success) {
        toast.success(`Successfully imported ${data.processed} records`);
        queryClient.invalidateQueries({ queryKey: ["traffic-fines"] });
      } else {
        throw new Error("Import failed");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast.error(error.message || "Failed to import file");
    } finally {
      setIsUploading(false);
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
        isAnalyzing={false}
      />

      <TrafficFineFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <TrafficFinesList
        searchQuery={searchQuery}
        statusFilter={statusFilter}
      />
    </div>
  );
};