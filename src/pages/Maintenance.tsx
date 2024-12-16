import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";

const Maintenance = () => {
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <CreateJobDialog />
      </div>
      <MaintenanceStats />
      <div className="mt-6 space-y-4">
        <MaintenanceFilters />
        <MaintenanceList />
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;