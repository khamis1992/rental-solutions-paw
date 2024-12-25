import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { isValid, parseISO } from "date-fns";

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validateDateFormat = (dateStr: string): boolean => {
    try {
      console.log('Validating date:', dateStr);
      const parsedDate = parseISO(dateStr);
      if (isValid(parsedDate)) {
        console.log('Date is valid ISO format');
        return true;
      }

      const date = new Date(dateStr);
      const isValidDate = isValid(date);
      console.log('Date validation result:', isValidDate);
      return isValidDate;
    } catch (error) {
      console.error('Date validation error:', error);
      return false;
    }
  };

  const validateCsvContent = async (file: File): Promise<boolean> => {
    console.log('Starting CSV validation for file:', file.name);
    const text = await file.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    console.log('CSV Headers:', lines[0]);
    console.log('Number of rows:', lines.length);
    
    if (lines.length < 2) {
      toast({
        title: "Invalid File",
        description: "File is empty or contains only headers",
        variant: "destructive",
      });
      return false;
    }

    // Skip header row and validate each data row
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      console.log(`Row ${i} columns:`, columns);
      
      // Validate date column (assuming it's the third column, index 2)
      if (columns.length >= 3 && !validateDateFormat(columns[2])) {
        console.error(`Invalid date in row ${i}:`, columns[2]);
        toast({
          title: "Invalid Date Format",
          description: `Row ${i + 1} contains an invalid date format. Expected YYYY-MM-DD or ISO date format.`,
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
      // Validate CSV content before processing
      const isValid = await validateCsvContent(file);
      if (!isValid) {
        setIsUploading(false);
        return;
      }

      const fileName = `traffic-fines/${Date.now()}_${file.name}`;
      console.log('Uploading file to storage:', fileName);
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully, processing...');

      // Process the file
      const { data: processingData, error: processingError } = await supabase.functions
        .invoke('process-traffic-fine-import', {
          body: { fileName }
        });

      if (processingError) {
        console.error('Processing error:', processingError);
        throw processingError;
      }

      console.log('Processing complete:', processingData);

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
          Upload a CSV file containing traffic fine records. Dates should be in YYYY-MM-DD format.
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