import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentSchedulesList } from "./PaymentSchedulesList";
import { PaymentHistoryList } from "./PaymentHistoryList";
import { PaymentForm } from "../details/PaymentForm";

interface PaymentTrackingTabsProps {
  agreementId: string;
  payments: any[];
  paymentHistory: any[];
  isLoading: boolean;
  onReconcileAll: () => void;
  isReconciling: boolean;
}

export function PaymentTrackingTabs({
  agreementId,
  payments,
  paymentHistory,
  isLoading,
  onReconcileAll,
  isReconciling,
}: PaymentTrackingTabsProps) {
  return (
    <Tabs defaultValue="schedules" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="schedules">Payment Schedules</TabsTrigger>
        <TabsTrigger value="history">Payment History</TabsTrigger>
        <TabsTrigger value="new">New Payment</TabsTrigger>
      </TabsList>

      <TabsContent value="schedules">
        <PaymentSchedulesList
          payments={payments}
          isLoading={isLoading}
          onReconcileAll={onReconcileAll}
          isReconciling={isReconciling}
        />
      </TabsContent>

      <TabsContent value="history">
        <PaymentHistoryList paymentHistory={paymentHistory} />
      </TabsContent>

      <TabsContent value="new">
        <PaymentForm agreementId={agreementId} />
      </TabsContent>
    </Tabs>
  );
}