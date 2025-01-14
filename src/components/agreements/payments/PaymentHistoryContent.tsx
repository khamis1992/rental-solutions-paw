import { ScrollArea } from "@/components/ui/scroll-area";
import { PaymentHistoryActions } from "./PaymentHistoryActions";
import { PaymentSummary } from "./PaymentSummary";
import { PaymentHistoryTable } from "./PaymentHistoryTable";

interface PaymentHistoryContentProps {
  agreementId?: string;
  paymentHistory: any[];
  isLoading: boolean;
  totalPaid: number;
  totalRefunded: number;
}

export function PaymentHistoryContent({
  agreementId,
  paymentHistory,
  isLoading,
  totalPaid,
  totalRefunded,
}: PaymentHistoryContentProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="space-y-6 px-6">
          <PaymentHistoryActions 
            agreementId={agreementId} 
            paymentCount={paymentHistory.length} 
          />
          <PaymentSummary totalPaid={totalPaid} totalRefunded={totalRefunded} />
          <PaymentHistoryTable paymentHistory={paymentHistory} isLoading={isLoading} />
        </div>
      </ScrollArea>
    </div>
  );
}