import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementHeader } from "@/components/agreements/AgreementHeader";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementPDFImport } from "@/components/agreements/AgreementPDFImport";
import { Button } from "@/components/ui/button";

const Agreements = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPDFImportOpen, setIsPDFImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Mock agreement data for header
  const mockAgreement = {
    id: "",
    agreement_number: "",
    status: "pending_payment" as const,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    rent_amount: 0,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <AgreementHeader 
          agreement={mockAgreement}
          remainingAmount={null}
        />
        
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
        
        <AgreementFilters 
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
        />
        
        <AgreementList />

        <CreateAgreementDialog 
          isOpen={isCreateDialogOpen} 
          onClose={() => setIsCreateDialogOpen(false)}
        />

        <AgreementPDFImport 
          isOpen={isPDFImportOpen} 
          onClose={() => setIsPDFImportOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;