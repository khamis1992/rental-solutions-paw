
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { FileText, ChevronRight } from "lucide-react";

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
      <div className="container mx-auto space-y-6 px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]" />
          
          <div className="relative px-6 py-8 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Agreements</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="h-8 w-8 text-primary animate-fade-in" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Agreements</h1>
                  <p className="text-muted-foreground">Manage your rental agreements and contracts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-start">
          <AgreementListHeader 
            onImportClick={handleImportClick}
            onDeleteClick={handleDeleteClick}
            isDeleting={false}
          />
          <PaymentImport />
        </div>

        <div className="animate-fade-in">
          <AgreementStats />
        </div>

        <div className="bg-white rounded-lg shadow-sm border animate-fade-in">
          <AgreementList />
        </div>
        
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;
