
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCircle, Phone, MapPin, FileCheck, FileText, Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const CustomerTableHeader = () => {
  return (
    <TableHeader className="bg-background-alt border-b">
      <TableRow>
        <TableHead className="py-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-muted-foreground" />
            Name
          </div>
        </TableHead>
        <TableHead className="py-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone
          </div>
        </TableHead>
        <TableHead className="py-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Address
          </div>
        </TableHead>
        <TableHead className="py-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            Driver License
          </div>
        </TableHead>
        <TableHead className="py-2 text-xs font-medium">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Documents
          </div>
        </TableHead>
        <TableHead className="py-2 text-xs font-medium text-right">
          <div className="flex items-center justify-end gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Actions
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
