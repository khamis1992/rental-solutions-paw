import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Upload, Loader2, FileDown } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const ImportExportCustomers = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create import log
      const { error: logError } = await supabase
        .from("import_logs")
        .insert({
          file_name: fileName,
          import_type: "customers",
          status: "pending",
        });

      if (logError) throw logError;

      toast({
        title: "Success",
        description: "File uploaded successfully. Processing will begin shortly.",
      });

      // Refresh the customer list after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
      }, 5000);

      setIsImportOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name,phone_number,address,driver_license,role")
        .eq("role", "customer");

      if (error) throw error;

      // Convert data to CSV
      const headers = ["Full Name,Phone Number,Address,Driver License,Role"];
      const csvData = data.map(row => 
        Object.values(row).join(",")
      );
      
      const csv = [...headers, ...csvData].join("\n");
      
      // Create and download file
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `customers-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    // Create sample data
    const headers = ["Full Name,Phone Number,Address,Driver License"];
    const sampleData = [
      "John Doe,+974 1234 5678,123 Main St Doha,DL123456",
      "Jane Smith,+974 2345 6789,456 Park Ave Doha,DL234567"
    ];
    
    const csv = [...headers, ...sampleData].join("\n");
    
    // Create and download file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customer-import-template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setIsImportOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>
      <Button
        variant="outline"
        onClick={handleExport}
      >
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button
        variant="outline"
        onClick={downloadTemplate}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Download Template
      </Button>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Customers</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing customer data. The file should include columns for: Full Name, Phone Number, Address, and Driver License. You can download a template file using the &quot;Download Template&quot; button.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};