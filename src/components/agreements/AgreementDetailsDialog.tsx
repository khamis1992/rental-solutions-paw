import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "./details/PaymentForm";
import { InvoiceList } from "./details/InvoiceList";
import { DocumentUpload } from "./details/DocumentUpload";
import { DamageAssessment } from "./details/DamageAssessment";
import { TrafficFines } from "./details/TrafficFines";

interface AgreementDetailsDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AgreementDetailsDialog = ({
  agreementId,
  open,
  onOpenChange,
}: AgreementDetailsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agreement Details</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="damages">Damages</TabsTrigger>
            <TabsTrigger value="fines">Traffic Fines</TabsTrigger>
          </TabsList>
          <TabsContent value="payments">
            <PaymentForm agreementId={agreementId} />
          </TabsContent>
          <TabsContent value="invoices">
            <InvoiceList agreementId={agreementId} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentUpload agreementId={agreementId} />
          </TabsContent>
          <TabsContent value="damages">
            <DamageAssessment agreementId={agreementId} />
          </TabsContent>
          <TabsContent value="fines">
            <TrafficFines agreementId={agreementId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};