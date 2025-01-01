import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementHeader } from "@/components/agreements/AgreementHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementImport } from "@/components/agreements/AgreementImport";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <AgreementHeader 
          onCreateClick={() => setShowCreateDialog(true)}
          onImportClick={() => setShowImportDialog(true)}
        />
        <AgreementStats />
        <AgreementFilters />
        <AgreementList />
        
        <CreateAgreementDialog 
          isOpen={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
        
        {showImportDialog && (
          <AgreementImport
            isOpen={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Agreements;