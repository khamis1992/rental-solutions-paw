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

interface Vehicle {
  make: string;
  model: string;
  year: number;
}

interface MaintenanceRecord {
  id: string;
  service_type: string;
  status: string;
  scheduled_date: string;
  cost: number | null;
  vehicles: Vehicle;
}

interface MaintenanceListProps {
  records: MaintenanceRecord[];
  isLoading: boolean;
}

export const MaintenanceList = ({ records, isLoading }: MaintenanceListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scheduled Date</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {record.vehicles.year} {record.vehicles.make} {record.vehicles.model}
              </TableCell>
              <TableCell>{record.service_type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    record.status === "completed"
                      ? "default"
                      : record.status === "in_progress"
                      ? "secondary"
                      : "destructive"
                  }
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