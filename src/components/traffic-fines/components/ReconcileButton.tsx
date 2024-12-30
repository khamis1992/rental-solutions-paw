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
    <div className="ml-4">
      <Button
        onClick={onReconcile}
        disabled={isReconciling || !unassignedCount}
        className="whitespace-nowrap"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
        Auto-Assign All
      </Button>
    </div>
  );
}