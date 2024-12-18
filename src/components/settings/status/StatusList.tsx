import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusListItem } from "./StatusListItem";

interface VehicleStatus {
  id: string;
  name: string;
  is_active: boolean;
}

interface StatusListProps {
  statuses: VehicleStatus[];
  onUpdate: (id: string, name: string) => Promise<void>;
  onToggle: (id: string, currentActive: boolean) => Promise<void>;
}

export const StatusList = ({ statuses, onUpdate, onToggle }: StatusListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status Name</TableHead>
          <TableHead>Current Usage</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statuses.map((status) => (
          <StatusListItem
            key={status.id}
            status={status}
            onUpdate={onUpdate}
            onToggle={onToggle}
          />
        ))}
      </TableBody>
    </Table>
  );
};