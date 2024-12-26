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

    if (file.type !== "text/csv") {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-remaining-amount-import', {
        body: formData,
      });

      if (error) throw error;

      toast.success("Data imported successfully!");
      queryClient.invalidateQueries({ queryKey: ['remaining-amounts'] });
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || "Failed to import data");
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Agreement Number,License Plate,Rent Amount,Final Price,Amount Paid,Remaining Amount,Agreement Duration\n" +
                      "AGR-001,ABC123,1000,1200,800,400,3 months";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'remaining_amount_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Remaining Amounts</CardTitle>
        <CardDescription>
          Upload a CSV file containing remaining amount data. Download the template to ensure correct format.
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
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Importing..." : "Upload CSV"}
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