import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InvoiceView } from "./InvoiceView";
import { useQuery } from "@tanstack/react-query";
import { generateInvoiceData } from "./utils/invoiceUtils";
import { Loader2 } from "lucide-react";

interface InvoiceDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceDialog = ({ agreementId, open, onOpenChange }: InvoiceDialogProps) => {
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["invoice", agreementId],
    queryFn: () => generateInvoiceData(agreementId),
    enabled: open,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
          <DialogDescription>
            Review and print the invoice for this agreement
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : invoiceData ? (
          <InvoiceView data={invoiceData} onPrint={handlePrint} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Failed to load invoice data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};