import { useState } from "react";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementPDFImport } from "@/components/agreements/AgreementPDFImport";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Agreements() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agreements</h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setImportDialogOpen(true)}
            variant="outline"
          >
            Import PDF
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Agreement
          </Button>
        </div>
      </div>

      <AgreementStats />
      
      <AgreementFilters 
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onSortChange={setSortOrder}
      />

      <AgreementList />

      <CreateAgreementDialog 
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      <AgreementPDFImport
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />
    </div>
  );
}