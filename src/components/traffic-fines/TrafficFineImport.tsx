import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload } from "lucide-react";
import { TrafficFinePreviewTable } from "./TrafficFinePreviewTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PreviewData {
  serial_number: string;
  violation_number: string;
  violation_date: string;
  license_plate: string;
  fine_location: string;
  violation_charge: string;
  fine_amount: number;
  violation_points: number;
}

export const TrafficFineImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const { toast } = useToast();

  const validateCSV = (headers: string[]) => {
    const requiredHeaders = [
      'serial_number',
      'violation_number',
      'violation_date',
      'license_plate',
      'fine_location',
      'violation_charge',
      'fine_amount',
      'violation_points'
    ];

    const missingHeaders = requiredHeaders.filter(
      header => !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
  };

  const parseCSV = (text: string): PreviewData[] => {
    const lines = text.split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    validateCSV(headers);
    
    return lines.slice(1)
      .filter(line => line.trim().length > 0)
      .map(line => {
        const values = line.split(',').map(v => v.trim());
        const record: any = {};
        headers.forEach((header, index) => {
          if (header === 'fine_amount' || header === 'violation_points') {
            record[header] = parseFloat(values[index]);
          } else {
            record[header] = values[index];
          }
        });
        return record as PreviewData;
      });
  };

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

    setIsAnalyzing(true);
    try {
      const text = await file.text();
      const parsedData = parseCSV(text);
      setPreviewData(parsedData);
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsedData.length} traffic fines to import`,
      });
    } catch (error: any) {
      console.error('CSV parsing error:', error);
      toast({
        title: "Error Parsing File",
        description: error.message || "Failed to parse CSV file",
        variant: "destructive",
      });
      setPreviewData([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `traffic-fines/${Date.now()}.csv`;
      
      // Upload the preview data as a JSON file
      const { error: uploadError } = await supabase.storage
        .from('imports')
        .upload(fileName, JSON.stringify(previewData));

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

      // Clear preview after successful import
      setPreviewData([]);

    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import traffic fines",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'serial_number',
      'violation_number',
      'violation_date',
      'license_plate',
      'fine_location',
      'violation_charge',
      'fine_amount',
      'violation_points'
    ].join(',');
    
    const example = [
      'TF-001',
      'V12345',
      '2024-03-20',
      'ABC123',
      'Main Street',
      'Speeding',
      '150.00',
      '2'
    ].join(',');
    
    const content = `${headers}\n${example}`;
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'traffic_fines_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Traffic Fines</CardTitle>
        <CardDescription>
          Upload a CSV file containing traffic fine records. Download the template to ensure correct format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" disabled={isUploading || isAnalyzing}>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Upload CSV"}
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || isAnalyzing}
              />
            </label>
          </Button>

          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={isUploading || isAnalyzing}
          >
            Download Template
          </Button>
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing file...
          </div>
        )}

        {previewData.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <TrafficFinePreviewTable data={previewData} />
            
            <div className="flex justify-end">
              <Button
                onClick={handleImport}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Traffic Fines'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};