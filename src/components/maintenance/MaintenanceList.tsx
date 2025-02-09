import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { 
  Wrench, 
  Clock, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Car, 
  Calendar,
  Calculator,
  Filter,
  Search,
  CheckCircle2,
  X
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateJobDialog } from "./CreateJobDialog";
import { EditMaintenanceDialog } from "./EditMaintenanceDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleTablePagination } from "@/components/vehicles/table/VehicleTablePagination";
import { Input } from "@/components/ui/input";
import { useSwipeActions } from "@/hooks/use-swipe-actions";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduled_date: string;
  cost?: number;
  description?: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  vehicles?: {
    make: string;
    model: string;
    license_plate: string;
  };
}

const ITEMS_PER_PAGE = 10;

export const MaintenanceList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ["maintenance-and-accidents"],
    queryFn: async () => {
      const { data: maintenanceRecords, error: maintenanceError } = await supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            make,
            model,
            license_plate
          )
        `)
        .not('status', 'in', '("completed","cancelled")')
        .order('scheduled_date', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      const { data: accidentVehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          license_plate
        `)
        .eq('status', 'accident');

      if (vehiclesError) throw vehiclesError;

      const accidentRecords: MaintenanceRecord[] = accidentVehicles.map(vehicle => ({
        id: `accident-${vehicle.id}`,
        vehicle_id: vehicle.id,
        service_type: 'Accident Repair',
        status: 'scheduled',
        scheduled_date: new Date().toISOString(),
        cost: null,
        description: 'Vehicle reported in accident status',
        vehicles: vehicle,
        completed_date: null,
        performed_by: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: null
      }));

      return [...maintenanceRecords, ...accidentRecords].sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    },
  });

  const handleStatusChange = async (recordId: string, newStatus: "scheduled" | "in_progress" | "completed" | "cancelled") => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
      toast.success('Job card deleted successfully');
    } catch (error) {
      console.error('Error deleting job card:', error);
      toast.error('Failed to delete job card');
    }
  };

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load maintenance records. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <CreateJobDialog />
        </div>
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-orange-100 border-2 border-orange-200">
              <Wrench className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <p className="text-xl font-semibold text-gray-800">No maintenance records found</p>
            <p className="text-sm text-gray-600 max-w-md">
              Create a new maintenance job to start tracking vehicle maintenance and repairs
            </p>
            <CreateJobDialog />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search maintenance records..."
              className="pl-8 h-10"
            />
          </div>
          <Button variant="outline" className="gap-2 h-10 touch-target">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
        <CreateJobDialog />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
        {currentRecords.map((record) => {
          const { swipeOffset, handlers, resetSwipe } = useSwipeActions({
            onDelete: () => handleDelete(record.id),
            threshold: 80
          });

          return (
            <Card 
              key={record.id} 
              className="relative flex flex-col min-h-[400px] overflow-hidden hover:shadow-lg transition-shadow duration-200 hover:scale-[1.02] transform active:scale-100"
              style={{
                transform: `translateX(-${swipeOffset}px)`,
                transition: 'transform 0.2s ease-out'
              }}
              {...handlers}
            >
              <div className="flex flex-col flex-1 p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <Select
                    value={record.status}
                    onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => 
                      handleStatusChange(record.id, value)
                    }
                  >
                    <SelectTrigger className={`w-[130px] touch-target ${
                      record.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                      record.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                      'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Scheduled
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <EditMaintenanceDialog record={record} />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                      className="hover:bg-red-100 hover:text-red-600 touch-target"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <Car className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-medium">
                      {record.vehicles 
                        ? `${record.vehicles.make} ${record.vehicles.model}`
                        : "Vehicle details unavailable"}
                    </p>
                    <Badge variant="secondary" className="mt-1 bg-sky-100 text-sky-800 hover:bg-sky-200">
                      {record.vehicles?.license_plate || "N/A"}
                    </Badge>
                  </div>
                </div>

                <div className="flex-1 bg-gradient-to-r from-orange-50/80 to-orange-100/80 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <p className="text-lg font-medium">{record.service_type}</p>
                  </div>
                  {record.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {record.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDateToDisplay(new Date(record.scheduled_date))}
                    </span>
                  </div>
                  {record.cost && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                      <Calculator className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-400">{record.cost}</span>
                      <span className="text-sm text-green-600 dark:text-green-400">QAR</span>
                    </div>
                  )}
                </div>
              </div>
              {swipeOffset > 0 && (
                <div className="swipe-indicator" />
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-6">
        <VehicleTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
