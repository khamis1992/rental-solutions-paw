import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MaintenanceTableHeader } from "./table/MaintenanceTableHeader";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";
import { VehicleTablePagination } from "../vehicles/table/VehicleTablePagination";

const ITEMS_PER_PAGE = 10;

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'urgent';
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
          
          // Invalidate and refetch queries
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

  const { data: records = [], isLoading } = useQuery({
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
            license_plate
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
          license_plate
        `)
        .eq('status', 'accident');

      if (vehiclesError) throw vehiclesError;

      // Convert accident vehicles to maintenance record format
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

      // Combine both arrays and sort by date
      return [...maintenanceRecords, ...accidentRecords].sort((a, b) => 
        new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime()
      );
    },
  });

  const totalPages = Math.ceil(records.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRecords = records.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td><Skeleton className="h-4 w-[120px]" /></td>
                <td><Skeleton className="h-4 w-[200px]" /></td>
                <td><Skeleton className="h-4 w-[100px]" /></td>
                <td><Skeleton className="h-4 w-[100px]" /></td>
                <td><Skeleton className="h-4 w-[150px]" /></td>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <MaintenanceTableHeader />
          <TableBody>
            {currentRecords.map((record) => (
              <MaintenanceTableRow key={record.id} record={record} />
            ))}
          </TableBody>
        </Table>
      </div>

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
