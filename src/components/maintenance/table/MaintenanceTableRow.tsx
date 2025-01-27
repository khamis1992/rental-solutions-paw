import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { MaintenanceStatusSelect } from "./MaintenanceStatusSelect";
import { DeleteMaintenanceDialog } from "./DeleteMaintenanceDialog";
import { useNavigate } from "react-router-dom";

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
  onEdit: (id: string) => void;
}

export const MaintenanceTableRow = ({ record, onEdit }: MaintenanceTableRowProps) => {
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  return (
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
          status={record.status}
          vehicleId={record.vehicle_id}
        />
      </TableCell>
      <TableCell>
        {new Date(record.scheduled_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {record.cost ? `${record.cost} QAR` : '-'}
      </TableCell>
      <TableCell className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(record.id)}
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <DeleteMaintenanceDialog 
          id={record.id}
          vehicleId={record.vehicle_id}
          status={record.status}
        />
      </TableCell>
    </TableRow>
  );
};