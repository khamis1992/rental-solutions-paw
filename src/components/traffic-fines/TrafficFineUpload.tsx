import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const TrafficFineUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imports')
        .upload(`traffic-fines/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Process the uploaded file
      const { data: processData, error: processError } = await supabase.functions
        .invoke('process-traffic-fines', {
          body: { fileName: uploadData.path }
        });

      if (processError) throw processError;

      toast({
        title: "Upload Successful",
        description: `Processed ${processData.totalFines} fines. ${processData.assignedFines} assigned, ${processData.unassignedFines} unassigned.`,
      });

      // Refresh queries
      await queryClient.invalidateQueries({ queryKey: ['traffic-fines'] });
      await queryClient.invalidateQueries({ queryKey: ['unassigned-fines'] });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Traffic Fines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button asChild disabled={isUploading}>
            <label className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </Button>
          <div className="text-sm text-muted-foreground">
            Upload a CSV file containing traffic fines. The file should include: Serial, Violation No., Date, Plate Number, Location, Charge, Fine Amount, and Points.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};