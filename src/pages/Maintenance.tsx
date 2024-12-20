import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceFilters, type MaintenanceFilters as FilterType } from "@/components/maintenance/MaintenanceFilters";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { PredictiveMaintenance } from "@/components/maintenance/PredictiveMaintenance";
import { Routes, Route, useParams } from "react-router-dom";
import VehicleInspectionForm from "@/components/maintenance/inspection/VehicleInspectionForm";

const MaintenanceInspection = () => {
  const { id } = useParams();
  return <VehicleInspectionForm maintenanceId={id || ''} />;
};

const Maintenance = () => {
  const [filters, setFilters] = useState<FilterType>({
    status: "all",
    serviceType: "",
    dateRange: "all"
  });

  return (
    <DashboardLayout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Maintenance</h1>
                <CreateJobDialog />
              </div>
              <MaintenanceStats />
              <div className="mt-6">
                <PredictiveMaintenance />
              </div>
              <div className="mt-6 space-y-4">
                <MaintenanceFilters filters={filters} setFilters={setFilters} />
                <MaintenanceList />
              </div>
            </>
          }
        />
        <Route 
          path="/:id/inspection" 
          element={<MaintenanceInspection />} 
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Maintenance;