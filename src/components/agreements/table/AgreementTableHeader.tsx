
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileContract, Car, UserCircle, Calendar, Tag, Settings2 } from "lucide-react";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-background-alt border-b">
      <TableRow>
        <TableHead className="w-[150px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <FileContract className="h-4 w-4 text-muted-foreground" />
            Agreement Number
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            License Plate
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            Vehicle
          </div>
        </TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            Customer Name
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Start Date
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            End Date
          </div>
        </TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Status
          </div>
        </TableHead>
        <TableHead className="text-right w-[150px] font-semibold text-primary">
          <div className="flex items-center justify-end gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
