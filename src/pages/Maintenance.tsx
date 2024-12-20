import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { PredictiveMaintenance } from "@/components/maintenance/PredictiveMaintenance";
import { Routes, Route } from "react-router-dom";
import VehicleInspectionForm from "@/components/maintenance/inspection/VehicleInspectionForm";

const Maintenance = () => {
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "",
    dateRange: "",
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
          element={<VehicleInspectionForm maintenanceId={params.id} />} 
        />
      </Routes>
    </DashboardLayout>
  );
};

export default Maintenance;