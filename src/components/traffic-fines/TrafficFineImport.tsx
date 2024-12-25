import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `raw-fines/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the uploaded file
      const { error: processingError } = await supabase.functions
        .invoke("process-traffic-fine-import", {
          body: { fileName }
        });

      if (processingError) throw processingError;

      toast({
        title: "Success",
        description: "File uploaded and processed successfully",
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
          Upload a CSV file containing traffic fine records. All data will be imported as-is.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button disabled={isUploading} asChild>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="flex items-center gap-2">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploading ? "Importing..." : "Import CSV"}
              </div>
            </label>
          </Button>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing file...
          </div>
        )}
      </CardContent>
    </Card>
  );
};