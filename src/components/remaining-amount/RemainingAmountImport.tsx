import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const RemainingAmountImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && file.type !== "text/tab-separated-values") {
      toast.error("Please upload a CSV or TSV file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-remaining-amount-import', {
        body: formData,
      });

      if (error) {
        console.error('Import error:', error);
        let errorMessage;
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.details || parsedError.error || error.message;
        } catch {
          errorMessage = error.message;
        }
        toast.error(errorMessage || "Failed to import data");
        return;
      }

      toast.success(`Successfully processed ${data?.processed || 0} records`);
      if (data?.errors?.length > 0) {
        toast.warning(`${data.errors.length} records had issues. Check the console for details.`);
        console.log('Import errors:', data.errors);
      }

      await queryClient.invalidateQueries({ queryKey: ['remaining-amounts'] });
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error("Failed to process import. Please check the file format and try again.");
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    // Headers exactly matching what the Edge Function expects
    const headers = [
      "Agreement Number",
      "License Plate", 
      "rent amount",
      "final price",
      "amout paid",
      "remaining amount",
      "Agreement Duration"
    ];
    
    // Sample data matching the format
    const sampleData = [
      "MR202462",
      "7042",
      "2100",
      "21350",
      "10350",
      "11000",
      "10"
    ];
    
    // Create CSV content with tab delimiter
    const csvContent = [
      headers.join('\t'),
      sampleData.join('\t')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'remaining_amount_template.tsv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Remaining Amounts</CardTitle>
        <CardDescription>
          Upload a tab-separated (TSV) file containing remaining amount data. Download the template to ensure correct format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="w-[200px]"
            disabled={isUploading}
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".csv,.tsv"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Importing..." : "Upload File"}
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
      </CardContent>
    </Card>
  );
};