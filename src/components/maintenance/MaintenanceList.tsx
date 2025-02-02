import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MaintenanceTableHeader } from "./table/MaintenanceTableHeader";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateJobDialog } from "./CreateJobDialog";
import type { Maintenance } from "@/types/maintenance";

const ITEMS_PER_PAGE = 10;

interface Vehicle {
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface MaintenanceRecord extends Maintenance {
  vehicles?: Vehicle;
}

export const MaintenanceList = () => {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Subscribe to both maintenance and vehicle status changes
    const maintenanceChannel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance'
        },
        async (payload) => {
          console.log('Maintenance update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
          
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

    const vehicleChannel = supabase
      .channel('vehicle-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehicles',
          filter: 'status=in.(maintenance,accident)'
        },
        async (payload) => {
          console.log('Vehicle status changed:', payload);
          await queryClient.invalidateQueries({ queryKey: ['maintenance-and-accidents'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(maintenanceChannel);
      supabase.removeChannel(vehicleChannel);
    };
  }, [queryClient]);

  const { data: records = [], isLoading, error } = useQuery({
    queryKey: ["maintenance-and-accidents"],
    queryFn: async () => {
      // First get maintenance records
      const { data: maintenanceRecords, error: maintenanceError } = await supabase
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
        .not('status', 'in', '("completed","cancelled")')
        .order('scheduled_date', { ascending: false });

      if (maintenanceError) throw maintenanceError;

      // Then get accident vehicles
      const { data: accidentVehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select(`
          id,
          make,
          model,
          year,
          license_plate
        `)
        .eq('status', 'accident');

      if (vehiclesError) throw vehiclesError;

      // Create maintenance records for accident vehicles
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

  if (records.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <CreateJobDialog />
        </div>
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No maintenance records found.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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