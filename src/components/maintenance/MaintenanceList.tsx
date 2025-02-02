import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";
import { CreateJobDialog } from "./CreateJobDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { toast } from "sonner";

export const MaintenanceList = () => {
  const queryClient = useQueryClient();
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

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <MaintenanceFilters
            filters={filters}
            setFilters={setFilters}
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
          setFilters={setFilters}
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
            <Card
              key={record.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {record.vehicle?.make} {record.vehicle?.model}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {record.vehicle?.license_plate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedRecord(record);
                    setShowEditDialog(true);
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <p className="text-lg font-medium">{record.service_type}</p>
                </div>
                {record.description && (
                  <p className="text-gray-600">{record.description}</p>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    Scheduled:{" "}
                    {new Date(record.scheduled_date).toLocaleDateString()}
                  </span>
                </div>
                {record.cost && (
                  <div className="px-3 py-1 bg-gray-100 rounded-full flex items-center space-x-1">
                    <span className="font-medium text-primary">{record.cost}</span>
                    <span className="text-sm text-gray-500">QAR</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedRecord && (
        <EditMaintenanceDialog
          record={selectedRecord}
          isOpen={showEditDialog} 
          onClose={() => setShowEditDialog(false)}
          onSave={() => {
            queryClient.invalidateQueries(["maintenance"]);
            setShowEditDialog(false);
          }}
        />
      )}
    </div>
  );
};
