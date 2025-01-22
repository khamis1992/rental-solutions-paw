import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateToDisplay } from "@/lib/dateUtils";

interface DamageRecord {
  id: string;
  reported_date: string;
  description: string;
  damage_location: string;
  source: string;
  reporter: string;
  images?: string[];
  status: string;
}

interface DamageReportsTableProps {
  records: DamageRecord[];
  onViewImages?: (images: string[]) => void;
}

export const DamageReportsTable = ({ records, onViewImages }: DamageReportsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Source</TableHead>
        <TableHead>Reporter</TableHead>
        <TableHead>Photos</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {records.map((damage) => (
        <TableRow key={damage.id}>
          <TableCell>
            {formatDateToDisplay(new Date(damage.reported_date))}
          </TableCell>
          <TableCell>{damage.description}</TableCell>
          <TableCell>{damage.damage_location}</TableCell>
          <TableCell>
            <Badge 
              variant="outline" 
              className="bg-[#8B5CF6] text-white hover:bg-[#7C3AED]"
            >
              {damage.source}
            </Badge>
          </TableCell>
          <TableCell>{damage.reporter}</TableCell>
          <TableCell>
            {damage.images && damage.images.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewImages?.(damage.images!)}
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