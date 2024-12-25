import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { parseCSVLine, validateDateFormat, validateCSVHeaders } from "./utils/csvParser";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateCsvContent = async (file: File): Promise<boolean> => {
    console.log('Starting CSV validation for file:', file.name);
    
    const text = await file.text();
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      toast({
        title: "Invalid File",
        description: "File is empty or contains only headers",
        variant: "destructive",
      });
      return false;
    }

    // Parse and validate headers
    const headers = parseCSVLine(lines[0]);
    console.log('Parsed headers:', headers);
    
    const { isValid, missingHeaders } = validateCSVHeaders(headers);
    if (!isValid) {
      toast({
        title: "Invalid CSV Format",
        description: `Missing required columns: ${missingHeaders.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    // Find the index of required columns
    const dateIndex = headers.findIndex(h => h.toLowerCase().trim() === 'violation_date');
    if (dateIndex === -1) {
      toast({
        title: "Invalid CSV Format",
        description: "Could not find violation_date column",
        variant: "destructive",
      });
      return false;
    }

    // Validate each data row
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      console.log(`Validating row ${i}:`, columns);

      if (columns.length !== headers.length) {
        toast({
          title: "Invalid Row Format",
          description: `Row ${i + 1} has incorrect number of columns`,
          variant: "destructive",
        });
        return false;
      }

      if (!validateDateFormat(columns[dateIndex])) {
        toast({
          title: "Invalid Date Format",
          description: `Row ${i + 1} contains an invalid date format. Expected YYYY-MM-DD format.`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, 'Size:', file.size, 'Type:', file.type);

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
      const isValid = await validateCsvContent(file);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      console.log('Uploading file to storage:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-traffic-fine-import', {
          body: { fileName }
        });

      if (processingError) {
        throw processingError;
      }

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
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Import Traffic Fines</h3>
        <p className="text-sm text-muted-foreground">
          Upload a CSV file containing traffic fine records. The file should include serial number, 
          violation number, date (YYYY-MM-DD), license plate, location, charge, amount, and points.
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