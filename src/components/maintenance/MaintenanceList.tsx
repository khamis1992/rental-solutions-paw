import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  cost: number | null;
  scheduled_date: string;
  completed_date: string | null;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicles: Vehicle;
}

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
} as const;

export const MaintenanceList = () => {
  const queryClient = useQueryClient();

  // Query to get vehicles in accident status
  const { data: accidentVehicles = [], isLoading: isLoadingAccidents } = useQuery({
    queryKey: ["accident-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, license_plate, status")
        .eq("status", "accident");

      if (error) throw error;
      
      return data.map(vehicle => ({
        id: vehicle.id,
        service_type: "Accident Repair",
        status: "urgent",
        scheduled_date: new Date().toISOString(),
        cost: null,
        vehicles: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license_plate: vehicle.license_plate
        }
      }));
    }
  });

  // Query to get maintenance records
  const { data: maintenanceRecords = [], isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            make,
            model,
            year,
            license_plate
          )
        `)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Combine regular maintenance records with accident vehicles
  const allRecords = [...maintenanceRecords, ...accidentVehicles];

  const handleStatusChange = async (recordId: string, newStatus: MaintenanceRecord['status']) => {
    try {
      const { error } = await supabase
        .from('maintenance')
        .update({ status: newStatus })
        .eq('id', recordId);

      if (error) throw error;

      // Invalidate and refetch the maintenance records
      await queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  if (isLoadingMaintenance || isLoadingAccidents) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>License Plate</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead className="text-right">Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.vehicles.license_plate}</TableCell>
              <TableCell className="font-medium">
                {record.vehicles.year} {record.vehicles.make} {record.vehicles.model}
              </TableCell>
              <TableCell>{record.service_type}</TableCell>
              <TableCell>
                {record.status === 'urgent' ? (
                  <Badge variant="destructive">Urgent</Badge>
                ) : (
                  <Select
                    defaultValue={record.status}
                    onValueChange={(value) => 
                      handleStatusChange(record.id, value as MaintenanceRecord['status'])
                    }
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue>
                        <Badge className={STATUS_COLORS[record.status]}>
                          {record.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </TableCell>
              <TableCell>
                {new Date(record.scheduled_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {record.cost ? `${record.cost} QAR` : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};