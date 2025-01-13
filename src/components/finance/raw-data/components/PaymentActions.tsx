import { Button } from "@/components/ui/button";
import { Brain, Trash2, RefreshCcw, CleaningServices } from "lucide-react";

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
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onAnalyzeAll}
        disabled={!hasUnprocessedPayments || isSubmitting}
        className="flex items-center gap-2"
      >
        <Brain className="h-4 w-4" />
        {isSubmitting ? 'Processing...' : 'Analyze All'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onCleanTable}
        disabled={!hasUnprocessedPayments || cleanTableMutationIsPending}
        className="flex items-center gap-2"
      >
        <CleaningServices className="h-4 w-4" />
        {cleanTableMutationIsPending ? 'Cleaning...' : 'Clean Table'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onCleanupStuck}
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        Cleanup Stuck
      </Button>
    </div>
  );
};