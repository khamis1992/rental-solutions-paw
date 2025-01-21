import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Car, Wrench, Archive, Trash2, FileDown } from "lucide-react";
import { toast } from "sonner";

interface BulkActionsMenuProps {
  selectedCount: number;
  onUpdateStatus: (status: string) => void;
  onScheduleMaintenance: () => void;
  onExport: () => void;
  onArchive: () => void;
  disabled?: boolean;
}

export const BulkActionsMenu = ({
  selectedCount,
  onUpdateStatus,
  onScheduleMaintenance,
  onExport,
  onArchive,
  disabled
}: BulkActionsMenuProps) => {
  if (selectedCount === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          <Car className="mr-2 h-4 w-4" />
          {selectedCount} vehicle{selectedCount !== 1 ? 's' : ''} selected
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => onUpdateStatus('available')}>
          <Car className="mr-2 h-4 w-4" />
          Mark as Available
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onUpdateStatus('maintenance')}>
          <Wrench className="mr-2 h-4 w-4" />
          Mark as Maintenance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onScheduleMaintenance}>
          <Wrench className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export Selected
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onArchive} className="text-destructive">
          <Archive className="mr-2 h-4 w-4" />
          Archive Selected
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};