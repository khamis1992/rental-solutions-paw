import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";
import { CreateJobDialog } from "./CreateJobDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { JobCard } from "./JobCard";

export const MaintenanceList = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
    dateRange: "all",
    categoryId: undefined
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance")
        .select(`
          *,
          vehicle:vehicle_id (
            make,
            model,
            year,
            license_plate
          ),
          category:category_id (
            name
          )
        `)
        .order("scheduled_date", { ascending: false });

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to fetch maintenance records");
        throw error;
      }

      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <MaintenanceFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
          <CreateJobDialog />
        </div>
        <div className="text-center py-4">Loading maintenance records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <MaintenanceFilters
          filters={filters}
          onFiltersChange={setFilters}
        />
        <CreateJobDialog />
      </div>

      {records.length === 0 ? (
        <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-orange-100 border-2 border-orange-200">
              <Wrench className="h-12 w-12 text-primary" />
            </div>
            <p className="text-xl font-semibold text-gray-800">No maintenance records found</p>
            <p className="text-sm text-gray-600 max-w-md">
              Create a new maintenance job to start tracking vehicle maintenance and repairs
            </p>
            <CreateJobDialog>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Job Card
              </Button>
            </CreateJobDialog>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <JobCard
              key={record.id}
              id={record.id}
              vehicleId={record.vehicle_id}
              vehicleInfo={record.vehicle}
              serviceType={record.service_type}
              category={record.category?.name || "routine"}
              priority={record.priority || "medium"}
              status={record.status}
              scheduledDate={record.scheduled_date}
              description={record.description}
              assignedTo={record.performed_by}
              estimatedHours={record.estimated_hours}
              laborRate={record.labor_rate}
              vehicleCondition={record.vehicle_condition}
              diagnosedIssues={record.diagnosed_issues}
              technicianNotes={record.notes}
            />
          ))}
        </div>
      )}

      {selectedRecord && (
        <EditMaintenanceDialog
          record={selectedRecord}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={() => {
            setShowEditDialog(false);
          }}
        />
      )}
    </div>
  );
};