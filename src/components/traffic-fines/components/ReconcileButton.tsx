import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ReconcileButtonProps {
  isReconciling: boolean;
  unassignedCount: number;
  onReconcile: () => void;
}

export function ReconcileButton({ 
  isReconciling, 
  unassignedCount, 
  onReconcile 
}: ReconcileButtonProps) {
  return (
    <Button
      onClick={onReconcile}
      disabled={isReconciling || !unassignedCount}
      variant="default"
      size="sm"
      className="text-sm font-medium"
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
      Auto-Assign All
    </Button>
  );
}