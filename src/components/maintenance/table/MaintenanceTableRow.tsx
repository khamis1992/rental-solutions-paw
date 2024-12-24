import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { StatusSelect } from "./StatusSelect";
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
          <StatusSelect 
            recordId={record.id}
            vehicleId={record.vehicle_id}
            currentStatus={record.status}
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
            recordId={record.id}
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