import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SinglePaymentForm } from "./SinglePaymentForm";

export interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
}

export function AddPaymentDialog({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess
}: AddPaymentDialogProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Payment Installment</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] px-1">
          <SinglePaymentForm 
            contractId={contractId} 
            onSuccess={handleSuccess}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}