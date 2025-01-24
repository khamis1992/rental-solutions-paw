import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export interface BulkActionsMenuProps {
  selectedCount: number;
  onDelete: () => void;
}

export const BulkActionsMenu = ({ selectedCount, onDelete }: BulkActionsMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center">
          <MoreHorizontal className="mr-2 h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onDelete} disabled={selectedCount === 0}>
          Delete {selectedCount > 1 ? "Selected" : "Selected Item"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
