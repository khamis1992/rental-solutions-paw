import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementPDFImport } from "@/components/agreements/AgreementPDFImport";
import { PaymentImport } from "@/components/agreements/PaymentImport";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showPaymentImport, setShowPaymentImport] = useState(false);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agreements</h1>
        <div className="flex gap-4">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Agreement
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import PDF
          </Button>
        </div>
      </div>

      <AgreementStats />
      <AgreementList />

      <CreateAgreementDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />
      
      <AgreementPDFImport 
        open={showImportDialog} 
        onOpenChange={setShowImportDialog}
      />

      <PaymentImport
        open={showPaymentImport}
        onOpenChange={setShowPaymentImport}
      />
    </div>
  );
};

export default Agreements;