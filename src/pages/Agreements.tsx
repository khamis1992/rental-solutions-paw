import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { Button } from "@/components/ui/button";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementImport } from "@/components/agreements/AgreementImport";
import { AgreementPDFImport } from "@/components/agreements/AgreementPDFImport";
import { PaymentHistoryDialog } from "@/components/agreements/PaymentHistoryDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FileUp, Trash2 } from "lucide-react";

export default function Agreements() {
  const [showAgreementImport, setShowAgreementImport] = useState(false);
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAllAgreements = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-all-agreements');
      
      if (error) throw error;
      
      toast.success('All agreements have been deleted');
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting agreements:', error);
      toast.error(error.message || 'Failed to delete agreements');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agreements</h1>
          <div className="flex items-center gap-3">
            <CreateAgreementDialog />
            <AgreementPDFImport />
            <Button
              variant="outline"
              onClick={() => setShowAgreementImport(true)}
              className="flex items-center"
            >
              <FileUp className="h-4 w-4 mr-2" />
              Import Agreements
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting}
              className="flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>

        <AgreementStats />
        <AgreementList />

        <AgreementImport
          open={showAgreementImport}
          onOpenChange={setShowAgreementImport}
        />

        <PaymentHistoryDialog
          open={isPaymentHistoryOpen}
          onOpenChange={setIsPaymentHistoryOpen}
        />

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all agreements
                and their associated data from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAllAgreements}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}