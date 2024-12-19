import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDetails } from "./types/alert-types";

interface AlertDetailsDialogProps {
  alert: AlertDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlertDetailsDialog({ alert, open, onOpenChange }: AlertDetailsDialogProps) {
  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{alert.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {alert.type === 'vehicle' && (
            <div className="space-y-2">
              <p><strong>Vehicle:</strong> {alert.vehicle?.year} {alert.vehicle?.make} {alert.vehicle?.model}</p>
              <p><strong>License Plate:</strong> {alert.vehicle?.license_plate}</p>
              <p><strong>Customer:</strong> {alert.customer?.full_name}</p>
              <p><strong>Phone Number:</strong> {alert.customer?.phone_number}</p>
            </div>
          )}
          {alert.type === 'payment' && (
            <div className="space-y-2">
              <p><strong>Customer:</strong> {alert.customer?.full_name}</p>
              <p><strong>Phone Number:</strong> {alert.customer?.phone_number}</p>
              <p><strong>Status:</strong> Payment Overdue</p>
            </div>
          )}
          {alert.type === 'maintenance' && (
            <div className="space-y-2">
              <p><strong>Vehicle:</strong> {alert.vehicle?.year} {alert.vehicle?.make} {alert.vehicle?.model}</p>
              <p><strong>License Plate:</strong> {alert.vehicle?.license_plate}</p>
              <p><strong>Status:</strong> Maintenance Required</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}