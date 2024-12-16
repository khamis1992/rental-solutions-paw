import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";

const Agreements = () => {
  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Rental Agreements</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all vehicle rental agreements
              </p>
            </div>
          </div>
          <AgreementStats />
          <div className="mt-6">
            <AgreementFilters />
          </div>
          <div className="mt-6">
            <AgreementList />
          </div>
        </main>
      </div>
    </>
  );
};

export default Agreements;