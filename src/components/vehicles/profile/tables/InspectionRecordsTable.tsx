import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface InspectionRecord {
  id: string;
  inspection_date: string;
  inspection_type: string;
  damage_markers: Json;
  inspection_photos: string[];
  photos: string[]; // For backward compatibility
}

interface InspectionRecordsTableProps {
  records: InspectionRecord[];
  onViewImages: (images: string[]) => void;
}

export const InspectionRecordsTable = ({ records, onViewImages }: InspectionRecordsTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Damage Markers</TableHead>
        <TableHead>Photos</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {records.map((inspection) => (
        <TableRow key={inspection.id}>
          <TableCell>
            {new Date(inspection.inspection_date).toLocaleDateString()}
          </TableCell>
          <TableCell>{inspection.inspection_type}</TableCell>
          <TableCell>
            {inspection.damage_markers ? 
              (Array.isArray(inspection.damage_markers) ? inspection.damage_markers.length : 0) + " damages marked"
              : "No damages"}
          </TableCell>
          <TableCell>
            {(inspection.inspection_photos?.length > 0 || inspection.photos?.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewImages(inspection.inspection_photos || inspection.photos)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                View Photos ({inspection.inspection_photos?.length || inspection.photos?.length})
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);