import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { InvoiceDialog } from "../InvoiceDialog";

interface InvoiceListProps {
  agreementId: string;
}

export const InvoiceList = ({ agreementId }: InvoiceListProps) => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  
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
      </div>
      
      <div className="space-y-2">
        <Button onClick={() => setSelectedInvoiceId(agreementId)}>
          Generate Invoice
        </Button>
      </div>

      <InvoiceDialog
        agreementId={selectedInvoiceId || ""}
        open={!!selectedInvoiceId}
        onOpenChange={(open) => !open && setSelectedInvoiceId(null)}
      />
    </div>
  );
};