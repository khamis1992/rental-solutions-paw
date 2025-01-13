import { Button } from "@/components/ui/button";
import { PlayCircle, Trash2, RefreshCw } from "lucide-react";

interface PaymentActionsProps {
  hasUnprocessedPayments: boolean;
  onAnalyzeAll: () => Promise<void>;
  onCleanTable: () => Promise<void>;
  onCleanupStuck: () => Promise<void>;
  isSubmitting: boolean;
  cleanTableMutationIsPending: boolean;
}

export const PaymentActions = ({
  hasUnprocessedPayments,
  onAnalyzeAll,
  onCleanTable,
  onCleanupStuck,
  isSubmitting,
  cleanTableMutationIsPending
}: PaymentActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        onClick={onAnalyzeAll}
        disabled={!hasUnprocessedPayments || isSubmitting}
      >
        <PlayCircle className="mr-2 h-4 w-4" />
        Process All
      </Button>

      <Button
        variant="outline"
        onClick={onCleanTable}
        disabled={!hasUnprocessedPayments || cleanTableMutationIsPending}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clean Table
      </Button>

      <Button
        variant="outline"
        onClick={onCleanupStuck}
        disabled={isSubmitting}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Cleanup Stuck
      </Button>
    </div>
  );
};