import { TableCell, TableRow } from "@/components/ui/table";
import { MaintenanceStatusSelect } from "./MaintenanceStatusSelect";
import { MaintenanceStatus } from "@/types/maintenance";

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string | null;
  status: MaintenanceStatus | "urgent";
  cost?: number | null;
  scheduled_date: string;
  completed_date?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
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
  // Extract vehicle ID from accident record ID if it exists
  const vehicleId = record.id.startsWith('accident-') 
    ? record.id.replace('accident-', '')
    : record.vehicle_id;

  return (
    <TableRow>
      <TableCell>
        {record.vehicles?.license_plate || 'N/A'}
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
          vehicleId={vehicleId}
          currentStatus={record.status}
          isAccidentRecord={record.id.startsWith('accident-')}
        />
      </TableCell>
      <TableCell>
        {new Date(record.scheduled_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        {record.cost ? `${record.cost} QAR` : '-'}
      </TableCell>
    </TableRow>
  );
};