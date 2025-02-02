import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CreateJobDialog } from "./CreateJobDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { MaintenanceFilters } from "./MaintenanceFilters";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const MaintenanceList = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance-records", statusFilter],
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

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Failed to fetch maintenance records");
        throw error;
      }

      return data;
    },
  });

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setShowEditDialog(true);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "urgent":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "accident":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <MaintenanceFilters
            selectedStatus={statusFilter}
            onStatusChange={handleStatusChange}
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
          selectedStatus={statusFilter}
          onStatusChange={handleStatusChange}
        />
        <CreateJobDialog />
      </div>

      {records.length === 0 ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <CreateJobDialog />
          </div>
          <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 rounded-full bg-orange-100 border-2 border-orange-200">
                <Wrench className="h-12 w-12 text-primary" />
              </div>
              <p className="text-xl font-semibold text-gray-800">No maintenance records found</p>
              <p className="text-sm text-gray-600 max-w-md">
                Create a new maintenance job to start tracking vehicle maintenance and repairs
              </p>
              <CreateJobDialog />
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <Card
              key={record.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(record.status)} capitalize`}
                  >
                    {record.status === "in_progress"
                      ? "In Progress"
                      : record.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(record)}
                >
                  Edit
                </Button>
              </div>

              {/* Vehicle Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg">
                  {record.vehicle?.make} {record.vehicle?.model}
                </h3>
                <p className="text-sm text-gray-500">
                  {record.vehicle?.license_plate}
                </p>
              </div>

              {/* Service Info */}
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

      <EditMaintenanceDialog
        record={selectedRecord}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={() => {
          queryClient.invalidateQueries(["maintenance-records"]);
          setShowEditDialog(false);
        }}
      />
    </div>
  );
};