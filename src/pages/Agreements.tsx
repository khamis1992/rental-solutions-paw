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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <AgreementHeader 
          onCreate={() => setShowCreateDialog(true)}
          onImport={() => setShowImportDialog(true)}
        />
        <AgreementStats />
        <AgreementFilters 
          onSearchChange={setSearchQuery}
          onStatusChange={setStatusFilter}
          onSortChange={setSortOrder}
        />
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