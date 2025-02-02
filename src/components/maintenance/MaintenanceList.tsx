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
import { AlertTriangle, Car, Calendar, Clock, Wrench } from "lucide-react";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 space-y-4">
            <div className="animate-pulse space-y-3">
              <Skeleton className="h-4 w-[70%]" />
              <Skeleton className="h-4 w-[100%]" />
              <Skeleton className="h-4 w-[60%]" />
            </div>
          </Card>
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
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <Wrench className="h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No maintenance records found</p>
            <p className="text-sm text-muted-foreground">
              Create a new maintenance job to get started
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <CreateJobDialog />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentRecords.map((record) => (
          <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-4 space-y-4">
              {/* Vehicle Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Car className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {record.vehicles 
                        ? `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}`
                        : "Vehicle details unavailable"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {record.vehicles?.license_plate || "N/A"}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium
                  ${record.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  ${record.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                  ${record.status === 'urgent' ? 'bg-red-100 text-red-800' : ''}
                  ${record.status === 'accident' ? 'bg-red-100 text-red-800' : ''}
                  ${record.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : ''}
                `}>
                  {record.status}
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-2">
                <p className="font-medium">{record.service_type}</p>
                {record.description && (
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                )}
              </div>

              {/* Date & Cost */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(record.scheduled_date).toLocaleDateString()}</span>
                </div>
                {record.cost && (
                  <span className="font-medium">{record.cost} QAR</span>
                )}
              </div>
            </div>
          </Card>
        ))}
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