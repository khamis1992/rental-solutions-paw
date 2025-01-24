import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface DeleteVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  count: number;
}

export const DeleteVehicleDialog = ({
  isOpen,
  onClose,
  onDelete,
  count,
}: DeleteVehicleDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {count} Vehicle{count !== 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} vehicle{count !== 1 ? 's' : ''}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};