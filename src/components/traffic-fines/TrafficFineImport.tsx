import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function TrafficFineImport() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: processingData, error: processingError } = await supabase.functions
        .invoke("process-traffic-fine-import", {
          body: { fileName }
        });

      if (processingError) throw processingError;

      toast({
        title: "Success",
        description: "Traffic fines imported successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Input
      id="import-fines-input"
      type="file"
      accept=".csv"
      onChange={handleFileUpload}
      disabled={isUploading}
      className="hidden"
    />
  );
}
