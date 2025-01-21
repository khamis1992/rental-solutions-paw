import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";

export default function Agreements() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Agreements</h1>
          <p className="text-muted-foreground">Manage rental agreements and contracts</p>
        </div>
        
        <AgreementStats />
        <AgreementFilters />
        <AgreementList />
      </div>
    </div>
  );
}