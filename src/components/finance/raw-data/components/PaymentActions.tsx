import { Button } from "@/components/ui/button";
import { Loader2, PlayCircle, Trash2 } from "lucide-react";

interface PaymentActionsProps {
  hasUnprocessedPayments: boolean;
  onAnalyzeAll: () => void;
  onCleanTable: () => void;
  isSubmitting: boolean;
  cleanTableMutationIsPending: boolean;
}

export const PaymentActions = ({
  hasUnprocessedPayments,
  onAnalyzeAll,
  onCleanTable,
  isSubmitting,
  cleanTableMutationIsPending
}: PaymentActionsProps) => {
  return (
    <div className="flex gap-2">
      {hasUnprocessedPayments && (
        <Button
          variant="default"
          onClick={onAnalyzeAll}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Analyze All
        </Button>
      )}
      <Button
        variant="outline"
        onClick={onCleanTable}
        disabled={cleanTableMutationIsPending}
        className="flex items-center gap-2"
      >
        {cleanTableMutationIsPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Clean Table
      </Button>
    </div>
  );
};