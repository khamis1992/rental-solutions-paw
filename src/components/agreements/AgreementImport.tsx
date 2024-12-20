import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AgreementImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgreementImport = ({ open, onOpenChange }: AgreementImportProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data, error } = await supabase.functions.invoke("import-agreements", {
        body: formData,
      });

      if (error) throw error;

      toast.success("Agreements imported successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error importing agreements:", error);
      toast.error("Failed to import agreements.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Agreements</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button
            onClick={handleImport}
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? "Importing..." : "Import"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
