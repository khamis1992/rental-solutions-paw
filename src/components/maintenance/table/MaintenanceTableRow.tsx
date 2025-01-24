import { TableCell, TableRow } from "@/components/ui/table";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { useState } from "react";
import { MaintenanceStatusSelect } from "./MaintenanceStatusSelect";
import { DeleteMaintenanceDialog } from "./DeleteMaintenanceDialog";

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

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Map 'urgent' status to 'accident' for display
  const displayStatus = record.status === 'urgent' ? 'accident' : record.status;

  return (
    <>
      <TableRow>
        <TableCell>
          <button
            onClick={() => setShowVehicleDetails(true)}
            className="text-primary hover:underline focus:outline-none"
          >
            {record.vehicles?.license_plate || 'N/A'}
          </button>
        </TableCell>
        <TableCell>
          {record.vehicles 
            ? `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}`
            : 'Vehicle details unavailable'}
        </TableCell>
        <TableCell>{record.service_type}</TableCell>
        <TableCell>
          <MaintenanceStatusSelect 
            id={record.id}
            status={displayStatus}
            vehicleId={record.vehicle_id}
          />
        </TableCell>
        <TableCell>
          {new Date(record.scheduled_date).toLocaleDateString()}
        </TableCell>
        <TableCell className="text-right">
          {record.cost ? `${record.cost} QAR` : '-'}
        </TableCell>
        <TableCell>
          <DeleteMaintenanceDialog 
            id={record.id}
            vehicleId={record.vehicle_id}
            status={record.status}
          />
        </TableCell>
      </TableRow>

      {showVehicleDetails && record.vehicle_id && (
        <VehicleDetailsDialog
          vehicleId={record.vehicle_id}
          open={showVehicleDetails}
          onOpenChange={setShowVehicleDetails}
        />
      )}
    </>
  );
};