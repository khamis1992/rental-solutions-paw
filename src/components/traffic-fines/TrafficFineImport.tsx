import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the file
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-traffic-fine-import', {
          body: { fileName }
        });

      if (processingError) throw processingError;

      toast({
        title: "Success",
        description: `Successfully imported ${processingData.processed} fines`,
      });

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import traffic fines",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Import Traffic Fines</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file containing traffic fine records.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button disabled={isUploading} asChild>
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Importing..." : "Import CSV"}
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </Button>
      </div>

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing file...
        </div>
      )}
    </div>
  );
};