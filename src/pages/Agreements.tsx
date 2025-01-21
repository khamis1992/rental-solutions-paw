import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  return (
    <DashboardLayout>
      <div className="w-full bg-background">
        <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <AgreementListHeader 
                onImportClick={handleImportClick}
                onDeleteClick={handleDeleteClick}
                isDeleting={false}
              />
              <PaymentImport />
            </div>
            <AgreementStats />
            <AgreementList />
            
            <CreateAgreementDialog 
              open={showCreateDialog} 
              onOpenChange={setShowCreateDialog}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Agreements;