import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { MaintenanceTableHeader } from "./table/MaintenanceTableHeader";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateJobDialog } from "./CreateJobDialog";
import { MaintenanceFilters } from "./MaintenanceFilters";

const ITEMS_PER_PAGE = 10;

interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: string;
}

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "urgent";
  cost?: number | null;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  vehicles?: Vehicle;
}

export const MaintenanceList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "all",
    dateRange: "all",
    vehicleStatus: "all"
  });

  useEffect(() => {
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance'
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          await queryClient.invalidateQueries({ queryKey: ['maintenance'] });
          await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          
          const eventType = payload.eventType;
          const message = eventType === 'INSERT' 
            ? 'New maintenance record created'
            : eventType === 'UPDATE'
            ? 'Maintenance record updated'
            : 'Maintenance record deleted';
          
          toast.info(message);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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
            year,
            license_plate,
            status
          )
        `)
        .order('scheduled_date', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      const { data: accidentVehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          year,
          license_plate,
          status
        `)
        .eq('status', 'accident');

      if (vehiclesError) throw vehiclesError;

      const accidentRecords: MaintenanceRecord[] = accidentVehicles.map(vehicle => ({
        id: `accident-${vehicle.id}`,
        vehicle_id: vehicle.id,
        service_type: 'Accident Repair',
        status: 'urgent',
        scheduled_date: new Date().toISOString(),
        cost: null,
        description: 'Vehicle reported in accident status',
        vehicles: vehicle
      }));

      let filteredRecords = [...maintenanceRecords, ...accidentRecords];

      // Apply filters
      if (filters.status !== "all") {
        filteredRecords = filteredRecords.filter(record => record.status === filters.status);
      }

      if (filters.vehicleStatus !== "all") {
        filteredRecords = filteredRecords.filter(record => record.vehicles?.status === filters.vehicleStatus);
      }

      // Apply date range filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const startDate = new Date();
        
        switch (filters.dateRange) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(now.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(now.getMonth() - 1);
            break;
        }

        filteredRecords = filteredRecords.filter(record => 
          new Date(record.scheduled_date) >= startDate && 
          new Date(record.scheduled_date) <= now
        );
      }

      return filteredRecords.sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    },
  });

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
      <Card className="rounded-md border">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="p-4"><Skeleton className="h-4 w-[120px]" /></td>
                <td className="p-4"><Skeleton className="h-4 w-[200px]" /></td>
                <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                <td className="p-4"><Skeleton className="h-4 w-[100px]" /></td>
                <td className="p-4"><Skeleton className="h-4 w-[150px]" /></td>
              </tr>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <MaintenanceFilters filters={filters} setFilters={setFilters} />
      <div className="flex justify-end">
        <CreateJobDialog />
      </div>
      <Card className="rounded-md border">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {currentRecords.map((record) => (
              <MaintenanceTableRow key={record.id} record={record} />
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-center mt-4">
        <VehicleTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};