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
import { Download, Upload, Loader2, FileDown } from "lucide-react";
import { useCustomerImport } from "./hooks/useCustomerImport";
import { useCustomerExport } from "./hooks/useCustomerExport";

export const ImportExportCustomers = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { isUploading, handleFileUpload } = useCustomerImport();
  const { handleExport, downloadTemplate } = useCustomerExport();

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      setIsImportOpen(false);
    }
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
              onChange={onFileChange}
              disabled={isUploading}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing import...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};