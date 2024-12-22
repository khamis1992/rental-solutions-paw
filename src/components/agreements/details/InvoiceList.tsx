import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { InvoiceDialog } from "../InvoiceDialog";
import { BatchInvoiceDialog } from "../BatchInvoiceDialog";
import { FileText, Files } from "lucide-react";

interface InvoiceListProps {
  agreementId: string;
}

export const InvoiceList = ({ agreementId }: InvoiceListProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showBatchGeneration, setShowBatchGeneration] = useState(false);
  
  const { data: agreement } = useQuery({
    queryKey: ["agreement", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select("*")
        .eq("id", agreementId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!agreement) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Invoices</h3>
        <div className="space-x-2">
          <Button onClick={() => setSelectedInvoiceId(agreementId)} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>
          <Button onClick={() => setShowBatchGeneration(true)}>
            <Files className="h-4 w-4 mr-2" />
            Batch Generate
          </Button>
        </div>
      </div>

      <InvoiceDialog
        agreementId={selectedInvoiceId || ""}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      />

      <BatchInvoiceDialog
        open={showBatchGeneration}
        onOpenChange={setShowBatchGeneration}
      />
    </div>
  );
};