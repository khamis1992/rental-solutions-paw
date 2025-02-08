
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
  X,
  Plus
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
import { cn } from "@/lib/utils";
import { useSwipeActions } from "@/hooks/use-swipe-actions";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const isMobile = useIsMobile();

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
      
      // Trigger haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
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
      
      // Trigger haptic feedback on mobile
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (error) {
      console.error('Error deleting job card:', error);
      toast.error('Failed to delete job card');
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      record.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vehicles?.license_plate.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const MaintenanceCard = ({ record }: { record: MaintenanceRecord }) => {
    const { swipeOffset, handlers, resetSwipe } = useSwipeActions({
      onDelete: () => handleDelete(record.id),
      threshold: 100
    });

    return (
      <Card 
        key={record.id} 
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
          "touch-pan-y"
        )}
        style={{
          transform: `translateX(-${swipeOffset}px)`,
        }}
        {...handlers}
      >
        <div className="absolute right-0 top-0 bottom-0 flex items-center bg-destructive px-4">
          <Trash2 className="h-6 w-6 text-white" />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <Select
              value={record.status}
              onValueChange={(value: "scheduled" | "in_progress" | "completed" | "cancelled") => 
                handleStatusChange(record.id, value)
              }
            >
              <SelectTrigger className={cn(
                "w-[130px] h-10",
                record.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                record.status === 'in_progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled" className="h-10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Scheduled
                  </div>
                </SelectItem>
                <SelectItem value="in_progress" className="h-10">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="completed" className="h-10">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Completed
                  </div>
                </SelectItem>
                <SelectItem value="cancelled" className="h-10">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Cancelled
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center items-center space-x-2 bg-gray-50 p-4 rounded-lg">
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

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Wrench className="h-5 w-5 text-primary" />
              <p className="text-lg font-medium">{record.service_type}</p>
            </div>
            {record.description && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {record.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {formatDateToDisplay(new Date(record.scheduled_date))}
              </span>
            </div>
            {record.cost && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                <Calculator className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">{record.cost}</span>
                <span className="text-sm text-green-600">QAR</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

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
      <div className="grid grid-cols-1 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-[400px] w-full" />
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
        <Card className="p-8 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
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
      <div className={cn(
        "flex gap-4",
        isMobile ? "flex-col" : "items-center"
      )}>
        <div className={cn(
          "relative",
          isMobile ? "w-full" : "w-1/3"
        )}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Search maintenance records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full pl-10 bg-white/50 hover:bg-white/80 transition-colors",
              "h-12 text-base", // Increased height for better touch targets
              "focus:ring-2 focus:ring-primary/20 focus:outline-none"
            )}
          />
        </div>
        
        <div className={cn(
          isMobile ? "w-full" : "w-1/4"
        )}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={cn(
              "w-full bg-white/50 hover:bg-white/80 transition-colors",
              "h-12 text-base", // Increased height for better touch targets
              "border border-input"
            )}>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="h-12">All Status</SelectItem>
              <SelectItem value="scheduled" className="h-12">Scheduled</SelectItem>
              <SelectItem value="in_progress" className="h-12">In Progress</SelectItem>
              <SelectItem value="completed" className="h-12">Completed</SelectItem>
              <SelectItem value="cancelled" className="h-12">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!isMobile && (
          <div className="flex-1 flex justify-end">
            <CreateJobDialog />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {currentRecords.map((record) => (
          <MaintenanceCard key={record.id} record={record} />
        ))}
      </div>

      {isMobile ? (
        <div className="fixed bottom-4 left-0 right-0 px-4 z-10">
          <Card className="w-full p-4 shadow-lg bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <VehicleTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                if (navigator.vibrate) {
                  navigator.vibrate(50);
                }
              }}
            />
          </Card>
        </div>
      ) : (
        <div className="flex justify-center mt-6">
          <VehicleTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {isMobile && (
        <div className="fixed right-4 bottom-24 z-20">
          <CreateJobDialog>
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </CreateJobDialog>
        </div>
      )}
    </div>
  );
};

