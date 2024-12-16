import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AgreementList } from "@/components/agreements/AgreementList";
import { AgreementStats } from "@/components/agreements/AgreementStats";
import { AgreementFilters } from "@/components/agreements/AgreementFilters";
import { CreateAgreementDialog } from "@/components/agreements/CreateAgreementDialog";

const Agreements = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rental Agreements</h1>
        <CreateAgreementDialog />
      </div>
      <AgreementStats />
      <div className="mt-6 space-y-4">
        <AgreementFilters />
        <AgreementList />
      </div>
    </DashboardLayout>
  );
};

export default Agreements;