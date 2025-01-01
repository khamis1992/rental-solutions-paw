import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementHeader } from "@/components/agreements/AgreementHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementPDFImport } from "@/components/agreements/AgreementPDFImport";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Agreements = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPDFImportOpen, setIsPDFImportOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <AgreementHeader />
        
        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setIsPDFImportOpen(true)}
          >
            Import PDF
          </Button>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Agreement
          </Button>
        </div>

        <AgreementStats />
        
        <AgreementFilters />
        
        <AgreementList />

        <CreateAgreementDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen}
        />

        <AgreementPDFImport 
          open={isPDFImportOpen} 
          onOpenChange={setIsPDFImportOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;