import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const REQUIRED_HEADERS = ['make', 'model', 'year', 'license_plate', 'vin'];
const VALID_STATUSES = [
  'maintenance',
  'available',
  'rented',
  'police_station',
  'accident',
  'reserve',
  'stolen'
];

export const ImportVehicles = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const validateCSVHeaders = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const headers = text.split('\n')[0].toLowerCase().split(',').map(h => h.trim());
        const missingFields = REQUIRED_HEADERS.filter(field => !headers.includes(field));
        
        if (missingFields.length > 0) {
          toast({
            title: "Invalid CSV Format",
            description: `Missing required columns: ${missingFields.join(', ')}. Please ensure your CSV includes all required fields: ${REQUIRED_HEADERS.join(', ')}`,
            variant: "destructive",
          });
          resolve(false);
        } else {
          resolve(true);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log('Starting file upload process...', file);
      
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please upload a CSV file');
      }

      // Validate headers
      const isValid = await validateCSVHeaders(file);
      if (!isValid) {
        return;
      }

      // Upload file to Supabase Storage
      const fileName = `vehicles/${Date.now()}-${file.name}`;
      console.log('Uploading file to storage:', fileName);
      
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      console.log('File uploaded successfully, calling edge function...');

      // Call Edge Function to process the file
      const { data: response, error: processError } = await supabase.functions
        .invoke('process-vehicle-import', {
          body: { fileName }
        });

      console.log('Edge function response:', response);

      if (processError) {
        console.error('Edge function error:', processError);
        throw processError;
      }

      if (!response?.success) {
        console.error('Import failed:', response?.error);
        throw new Error(response?.error || 'Failed to process file');
      }

      toast({
        title: "Import Successful",
        description: response.message,
      });

      if (response.errors?.length > 0) {
        console.error('Import errors:', response.errors);
        toast({
          title: "Import Warnings",
          description: `There were ${response.errors.length} errors during import. Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import vehicles",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name);
      await handleFileUpload(file);
    }
  };

  const downloadTemplate = () => {
    const headers = ['make', 'model', 'year', 'license_plate', 'vin', 'color', 'mileage', 'status'].join(',');
    const sampleData = 'Toyota,Camry,2023,ABC123,1HGCM82633A123456,Black,5000,available';
    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vehicle_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button onClick={downloadTemplate} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download Template
      </Button>
      <Button disabled={isUploading} asChild>
        <label className="cursor-pointer">
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Importing..." : "Import CSV"}
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </Button>
    </div>
  );
};