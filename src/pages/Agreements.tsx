import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementHeader } from "@/components/agreements/AgreementHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementImport } from "@/components/agreements/AgreementImport";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-8">
        <AgreementHeader remainingAmount={0} />
        <AgreementStats />
        <AgreementList />
        
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
        
        {showImportDialog && (
          <AgreementImport
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Agreements;