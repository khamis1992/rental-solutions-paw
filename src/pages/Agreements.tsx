import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentHistoryDialog } from "@/components/agreements/PaymentHistoryDialog";
import { AgreementImport } from "@/components/agreements/AgreementImport";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Agreements = () => {
  const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
  const [showAgreementImport, setShowAgreementImport] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");

  const handleDeleteAllAgreements = async () => {
    if (password !== "4830") {
      toast.error("Incorrect password");
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Calling delete-all-agreements function...');
      
      const { data, error } = await supabase.functions.invoke('delete-all-agreements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (error) {
        console.error('Error deleting agreements:', error);
        toast.error("Failed to delete agreements");
        return;
      }
      
      console.log('Delete operation response:', data);
      toast.success("All agreements have been deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error('Error deleting agreements:', error);
      toast.error("Failed to delete agreements");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPassword("");
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
            onClick={() => setShowDeleteDialog(true)}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Agreements</AlertDialogTitle>
            <AlertDialogDescription>
              Please enter the password to confirm deletion of all agreements.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteDialog(false);
              setPassword("");
            }}>
              Cancel
            </AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllAgreements}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Agreements;