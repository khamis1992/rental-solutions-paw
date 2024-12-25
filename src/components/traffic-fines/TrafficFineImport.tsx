import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
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

    const sampleData = [
      "A123,V456,2024-03-20,ABC123,Dubai Marina,Speeding,500,2",
      "B234,V789,2024-03-21,XYZ789,JBR,Parking,200,1"
    ].join("\n");

    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "traffic_fines_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
      // Upload file to Supabase Storage
      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imports")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Process the uploaded file
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke("process-traffic-fine-import", {
          body: { fileName }
        });

      if (processingError) {
        console.error('Processing error:', processingError);
        throw new Error(processingError.message || 'Failed to process file');
      }

      toast({
        title: "Success",
        description: "File uploaded successfully",
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
          Upload a CSV file containing traffic fine records. The file should include serial number,
          violation number, date (YYYY-MM-DD), license plate, location, charge, amount, and points.
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

          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={isUploading}
          >
            Download Template
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