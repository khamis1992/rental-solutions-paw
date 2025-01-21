import { LegalCasesList } from "@/components/legal/LegalCasesList";
import { CaseManagementHeader } from "@/components/legal/CaseManagementHeader";

export default function Legal() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Legal</h1>
          <p className="text-muted-foreground">Manage legal cases and documentation</p>
        </div>
        
        <CaseManagementHeader />
        <LegalCasesList />
      </div>
    </div>
  );
}