import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentHistoryDialog } from "@/components/agreements/PaymentHistoryDialog";
import { Button } from "@/components/ui/button";

const Agreements = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agreements</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPaymentHistoryOpen(true)}
          >
            Import Payments
          </Button>
          <CreateAgreementDialog />
        </div>
      </div>
      <AgreementStats />
      <div className="mt-6 space-y-4">
        <AgreementList />
      </div>

      <PaymentHistoryDialog
        open={isPaymentHistoryOpen}
        onOpenChange={setIsPaymentHistoryOpen}
      />
    </DashboardLayout>
  );
};

export default Agreements;