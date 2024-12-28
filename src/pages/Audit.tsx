import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuditRecordsDashboard } from "@/components/finance/audit/AuditRecordsDashboard";

const Audit = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <AuditRecordsDashboard />
      </div>
    </DashboardLayout>
  );
};

export default Audit;