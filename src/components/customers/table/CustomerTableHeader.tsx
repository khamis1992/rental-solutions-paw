import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, Phone, MapPin, FileText, Calendar } from "lucide-react";

export const CustomerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Name
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Address
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Documents
          </div>
        </TableHead>
        <TableHead>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Created
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};