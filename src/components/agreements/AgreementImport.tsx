import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { parseCSV } from "./utils/csvUtils";
import { createAgreement } from "./services/agreementImportService";

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
      let pendingPaymentCount = 0;

      console.log('Total agreements in CSV:', totalAgreements);
      
      for (const agreement of agreements) {
        try {
          console.log('Processing agreement:', {
            number: agreement['Agreement Number'],
            status: agreement['STATUS'],
            customerName: agreement['Customer Name']
          });

          if (agreement['STATUS']?.toLowerCase() === 'pending_payment') {
            pendingPaymentCount++;
            console.log('Found pending_payment agreement:', agreement['Agreement Number']);
          }

          await createAgreement(agreement);
          processedCount++;
        } catch (error) {
          console.error('Error processing agreement:', error);
          console.error('Failed agreement data:', agreement);
        } finally {
          setProgress((processedCount / totalAgreements) * 100);
        }
      }

      console.log('Import summary:', {
        total: totalAgreements,
        processed: processedCount,
        pendingPayment: pendingPaymentCount
      });

      toast({
        title: "Import Complete",
        description: `Processed ${processedCount} agreements (${pendingPaymentCount} pending payment)`,
      });
      
      await queryClient.invalidateQueries({ queryKey: ["agreements"] });
      await queryClient.invalidateQueries({ queryKey: ["agreements-stats"] });
      
    } catch (error) {
      console.error('Import process error:', error);
      toast({
        title: "Import Error",
        description: "Failed to process some agreements. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "Agreement Number,Car No,Customer Name,License Number,Start Date,End Date,Return Date,STATUS\n" +
                      "AGR001,ABC123,John Doe,DL456,27/03/2024,28/03/2024,29/03/2024,active";
    
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