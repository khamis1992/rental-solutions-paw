
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementListHeader } from "@/components/agreements/list/AgreementListHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { PaymentImport } from "@/components/agreements/PaymentImport";
import { FileText, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Agreements = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const isMobile = useIsMobile();

  const handleImportClick = () => {
    // Import handling logic
  };

  const handleDeleteClick = () => {
    // Delete handling logic
  };

  return (
    <DashboardLayout>
      <div className={cn(
        "container mx-auto space-y-6",
        isMobile ? "px-0 py-4" : "px-4 py-8"
      )}>
        {/* Hero Section with Glassmorphism */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]" />
          
          <div className={cn(
            "relative space-y-4",
            isMobile ? "px-4 py-6" : "px-6 py-8"
          )}>
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

        {!isMobile && (
          <div className="flex justify-between items-start">
            <AgreementListHeader 
              onImportClick={handleImportClick}
              onDeleteClick={handleDeleteClick}
              isDeleting={false}
            />
            <PaymentImport />
          </div>
        )}

        {!isMobile && (
          <div className="animate-fade-in">
            <AgreementStats />
          </div>
        )}

        <div className={cn(
          "bg-white rounded-lg shadow-sm border animate-fade-in",
          isMobile && "border-x-0 rounded-none"
        )}>
          <AgreementList />
        </div>
        
        {isMobile && (
          <div className="fixed right-4 bottom-24 z-20">
            <Button
              className={cn(
                "h-14 w-14 rounded-full shadow-lg",
                "bg-primary hover:bg-primary/90",
                "transition-all duration-200",
                "active:scale-95"
              )}
              onClick={() => setShowCreateDialog(true)}
            >
              <FileText className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
        
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;
