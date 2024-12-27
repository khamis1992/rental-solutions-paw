import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnhancedCustomerProfile } from "./profile/EnhancedCustomerProfile";

interface CustomerDetailsDialogProps {
  customerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CustomerDetailsDialog = ({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailsDialogProps) => {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Profile</DialogTitle>
        </DialogHeader>
        <EnhancedCustomerProfile customerId={customerId} />
      </DialogContent>
    </Dialog>
  );
};