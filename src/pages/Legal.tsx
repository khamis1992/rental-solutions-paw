import { LegalCasesList } from "@/components/legal/LegalCasesList";
import { CaseManagementHeader } from "@/components/legal/CaseManagementHeader";
import { useState } from "react";

export default function Legal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleCreateCase = () => {
    // Handle case creation
  };

  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Legal Cases</h1>
          <p className="text-muted-foreground">Manage legal cases and documentation</p>
        </div>
        
        <CaseManagementHeader 
          onCreateCase={handleCreateCase}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        <LegalCasesList />
      </div>
    </div>
  );
}