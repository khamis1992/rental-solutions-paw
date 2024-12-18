import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentHistoryDialog } from "@/components/agreements/PaymentHistoryDialog";
import { AgreementImport } from "@/components/agreements/AgreementImport";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Agreements = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [showAgreementImport, setShowAgreementImport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAllAgreements = async () => {
    if (!confirm("Are you sure you want to delete ALL agreements? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-all-agreements');
      
      if (error) throw error;
      
      toast.success("All agreements have been deleted successfully");
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting agreements:', error);
      toast.error("Failed to delete agreements");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agreements</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAgreementImport(!showAgreementImport)}
          >
            Import Agreements
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsPaymentHistoryOpen(true)}
          >
            Import Payments
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAllAgreements}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete All Agreements"}
          </Button>
          <CreateAgreementDialog />
        </div>
      </div>
      
      {showAgreementImport && (
        <div className="mb-6 p-4 border rounded-lg bg-background">
          <h2 className="text-lg font-semibold mb-4">Import Agreements</h2>
          <AgreementImport />
        </div>
      )}
      
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