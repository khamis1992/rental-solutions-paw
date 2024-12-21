import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface DamageRecord {
  id: string;
  reported_date: string;
  description: string;
  notes: string;
  leases: {
    profiles?: {
      full_name: string;
    };
  };
  images: string[];
  status: string;
}

interface DamageReportsTableProps {
  records: DamageRecord[];
  onViewImages: (images: string[]) => void;
}

export const DamageReportsTable = ({ records, onViewImages }: DamageReportsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Photos</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {records.map((damage) => (
        <TableRow key={damage.id}>
          <TableCell>
            {new Date(damage.reported_date).toLocaleDateString()}
          </TableCell>
          <TableCell>{damage.description}</TableCell>
          <TableCell>{damage.notes}</TableCell>
          <TableCell>
            {damage.leases?.profiles?.full_name || "N/A"}
          </TableCell>
          <TableCell>
            {damage.images && damage.images.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewImages(damage.images)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                View Photos ({damage.images.length})
              </Button>
            )}
          </TableCell>
          <TableCell className="capitalize">{damage.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);