interface BulkPaymentFormProps {
  contractId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function BulkPaymentForm({ contractId, onSuccess, onClose }: BulkPaymentFormProps) {
  return (
    <div className="p-4 text-center text-muted-foreground">
      Bulk payment feature coming soon...
    </div>
  );
}