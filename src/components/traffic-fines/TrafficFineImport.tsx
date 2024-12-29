import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

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

    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import traffic fines",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Traffic Fines</CardTitle>
        <CardDescription>
          Upload a CSV file containing traffic fine records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild disabled={isUploading}>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Importing..." : "Import CSV"}
          </label>
        </Button>
      </CardContent>
    </Card>
  );
}