import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SinglePaymentForm } from "./SinglePaymentForm";
import { BulkPaymentForm } from "./BulkPaymentForm";

export interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  onSuccess?: () => void;
  totalInstallments?: number;
}

export function AddPaymentDialog({ 
  open, 
  onOpenChange, 
  contractId,
  onSuccess,
  totalInstallments 
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
          <Tabs defaultValue="single" className="space-y-4">
            <TabsList>
              <TabsTrigger value="single">Single Payment</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Payments</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              <SinglePaymentForm 
                contractId={contractId} 
                onSuccess={handleSuccess}
                totalInstallments={totalInstallments}
              />
            </TabsContent>
            <TabsContent value="bulk">
              <BulkPaymentForm 
                contractId={contractId} 
                onSuccess={handleSuccess}
              />
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}