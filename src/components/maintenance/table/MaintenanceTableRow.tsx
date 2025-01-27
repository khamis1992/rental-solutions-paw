import { TableCell, TableRow } from "@/components/ui/table";
import { MaintenanceStatusSelect } from "./MaintenanceStatusSelect";
import { DeleteMaintenanceDialog } from "./DeleteMaintenanceDialog";
import { EditMaintenanceDialog } from "../EditMaintenanceDialog";
import { format } from "date-fns";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  cost?: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

interface MaintenanceTableRowProps {
  record: MaintenanceRecord;
}

export const MaintenanceTableRow = ({ record }: MaintenanceTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        {record.vehicles?.license_plate || "N/A"}
      </TableCell>
      <TableCell>
        {record.vehicles 
          ? `${record.vehicles.year} ${record.vehicles.make} ${record.vehicles.model}`
          : "Vehicle details unavailable"}
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
        {format(new Date(record.scheduled_date), "PPP")}
      </TableCell>
      <TableCell className="text-right">
        {record.cost ? `${record.cost} QAR` : "-"}
      </TableCell>
      <TableCell className="flex items-center space-x-2">
        <EditMaintenanceDialog record={record} />
        <DeleteMaintenanceDialog 
          id={record.id}
          vehicleId={record.vehicle_id}
          status={record.status}
        />
      </TableCell>
    </TableRow>
  );
};