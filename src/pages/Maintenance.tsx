import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceFilters, type MaintenanceFilters as FilterType } from "@/components/maintenance/MaintenanceFilters";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { PredictiveMaintenance } from "@/components/maintenance/PredictiveMaintenance";
import { Routes, Route, useParams } from "react-router-dom";
import VehicleInspectionForm from "@/components/maintenance/inspection/VehicleInspectionForm";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { PartsInventory } from "@/components/maintenance/parts/PartsInventory";

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
            <div className="space-y-6">
              <Card className="border-b">
                <CardContent className="py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-6 w-6 text-primary" />
                      <h1 className="text-3xl font-bold">Maintenance</h1>
                    </div>
                    <CreateJobDialog />
                  </div>
                </CardContent>
              </Card>

              <MaintenanceStats />
              
              <div className="space-y-6">
                <PredictiveMaintenance />
                <MaintenanceFilters filters={filters} setFilters={setFilters} />
                <MaintenanceList />
                <PartsInventory />
              </div>
            </div>
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