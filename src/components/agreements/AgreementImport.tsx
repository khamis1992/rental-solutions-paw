import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { parseCSV } from "./utils/csvUtils";
import { getOrCreateCustomer, getAvailableVehicle, createAgreement } from "./services/agreementImportService";

export const AgreementImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const content = await file.text();
      const agreements = parseCSV(content);
      const totalAgreements = agreements.length;
      let processedCount = 0;
      let errorCount = 0;

      const vehicle = await getAvailableVehicle();

      for (const agreement of agreements) {
        try {
          const customer = await getOrCreateCustomer(agreement['full_name']);
          await createAgreement(agreement, customer.id, vehicle.id);
          processedCount++;
        } catch (error) {
          console.error('Error processing agreement:', error);
          errorCount++;
        } finally {
          setProgress(((processedCount + errorCount) / totalAgreements) * 100);
        }
      }

      toast({
        title: "Import Complete",
        description: `Processed ${processedCount} agreements (${errorCount} errors)`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["agreements"] });
      await queryClient.invalidateQueries({ queryKey: ["agreements-stats"] });
      
    } catch (error: any) {
      console.error('Import process error:', error);
      toast({
        title: "Import Completed with Errors",
        description: "Some agreements may not have been imported correctly. Check console for details.",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Agreement Number,License No,full_name,License Number,Check-out Date,Check-in Date,Return Date,STATUS\n" +
                      "AGR001,LIC123,John Doe,DL456,2024-03-27,2024-03-28,2024-03-29,active";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'agreement_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={downloadTemplate}
          disabled={isUploading}
        >
          Download Template
        </Button>
      </div>
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Importing agreements...
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};