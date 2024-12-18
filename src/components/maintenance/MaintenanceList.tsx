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
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface MaintenanceRecord {
  id: string;
  service_type: string;
  status: string;
  scheduled_date: string;
  cost: number | null;
  vehicles: Vehicle;
}

const STATUS_COLORS = {
  scheduled: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  urgent: "bg-red-100 text-red-800",
  delayed: "bg-purple-100 text-purple-800",
  cancelled: "bg-gray-100 text-gray-800",
} as const;

interface MaintenanceListProps {
  records: MaintenanceRecord[];
  isLoading: boolean;
}

export const MaintenanceList = ({ records, isLoading }: MaintenanceListProps) => {
  // Query to get vehicles in accident status
  const { data: accidentVehicles = [], isLoading: isLoadingAccidents } = useQuery({
    queryKey: ["accident-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("id, make, model, year, license_plate, status")
        .eq("status", "accident");

      if (error) throw error;
      
      // Transform vehicle data to match maintenance record format
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

  // Combine regular maintenance records with accident vehicles
  const allRecords = [...records, ...accidentVehicles];

  if (isLoading || isLoadingAccidents) {
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
    <div className="rounded-lg border">
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
                <Badge
                  className={STATUS_COLORS[record.status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800"}
                >
                  {record.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(record.scheduled_date).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {record.cost ? formatCurrency(record.cost) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};