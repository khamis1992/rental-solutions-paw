import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";

const Agreements = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Rental Agreements</h1>
                <p className="text-muted-foreground mt-1">
                  Manage and track all vehicle rental agreements
                </p>
              </div>
              <CreateAgreementDialog />
            </div>
            <div className="grid gap-6">
              <AgreementStats />
              <AgreementFilters />
              <AgreementList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Agreements;