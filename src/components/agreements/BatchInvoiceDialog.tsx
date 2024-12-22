import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import { generateInvoiceData } from "./utils/invoiceUtils";
import { InvoiceView } from "./InvoiceView";

interface BatchInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BatchInvoiceDialog = ({ open, onOpenChange }: BatchInvoiceDialogProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [generatedInvoices, setGeneratedInvoices] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: agreements } = useQuery({
    queryKey: ["pending-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          id,
          agreement_number,
          customer:profiles(full_name),
          vehicle:vehicles(make, model, year)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleGenerateAll = async () => {
    if (!agreements?.length) return;
    
    setIsGenerating(true);
    const generated: string[] = [];

    try {
      for (let i = 0; i < agreements.length; i++) {
        setCurrentIndex(i);
        const invoice = await generateInvoiceData(agreements[i].id);
        if (invoice) {
          generated.push(agreements[i].id);
          // Simulate PDF generation delay
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success(`Successfully generated ${generated.length} invoices`);
      setGeneratedInvoices(generated);
    } catch (error) {
      console.error("Error generating invoices:", error);
      toast.error("Failed to generate some invoices");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintAll = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Batch Invoice Generation</DialogTitle>
          <DialogDescription>
            Generate invoices for all active agreements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                {agreements?.length || 0} agreements found
              </p>
            </div>
            <div className="space-x-2">
              <Button
                onClick={handleGenerateAll}
                disabled={isGenerating || !agreements?.length}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating {currentIndex + 1} of {agreements?.length}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate All
                  </>
                )}
              </Button>
              {generatedInvoices.length > 0 && (
                <Button onClick={handlePrintAll} variant="outline">
                  Print All
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {agreements?.map((agreement) => (
              <div
                key={agreement.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {agreement.agreement_number} - {agreement.customer?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {agreement.vehicle?.year} {agreement.vehicle?.make} {agreement.vehicle?.model}
                  </p>
                </div>
                {generatedInvoices.includes(agreement.id) ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : isGenerating && agreements[currentIndex].id === agreement.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};