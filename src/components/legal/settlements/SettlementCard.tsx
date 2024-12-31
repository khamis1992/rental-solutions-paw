import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReceiptViewer } from "@/components/finance/receipts/ReceiptViewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettlementCardProps {
  settlement: any;
  onStatusChange: (settlementId: string, newStatus: string) => Promise<void>;
  onRecordPayment: (settlementId: string) => void;
}

export const SettlementCard = ({ settlement, onStatusChange, onRecordPayment }: SettlementCardProps) => {
  const totalPaid = settlement.settlement_payments?.reduce(
    (sum: number, payment: any) => sum + (payment.amount || 0),
    0
  );

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">
            Amount: {formatCurrency(settlement.total_amount)}
          </p>
          <p className="text-sm text-muted-foreground">
            Created: {format(new Date(settlement.created_at), "PPP")}
          </p>
          <p className="text-sm text-muted-foreground">
            Customer: {settlement.legal_cases.customer.full_name}
          </p>
          <p className="text-sm text-muted-foreground">
            Case Type: {settlement.legal_cases.case_type}
          </p>
          <p className="text-sm text-muted-foreground">
            Case Created: {format(new Date(settlement.legal_cases.created_at), "PPP")}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Select
            defaultValue={settlement.status}
            onValueChange={(value) => onStatusChange(settlement.id, value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Badge
            variant="secondary"
            className={
              settlement.status === "completed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {settlement.status}
          </Badge>
        </div>
      </div>
      <div className="text-sm">
        <p className="font-medium">Terms:</p>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {settlement.terms}
        </p>
      </div>
      {settlement.payment_plan && typeof settlement.payment_plan === 'object' && (
        <div className="text-sm">
          <p className="font-medium">Payment Plan:</p>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {(settlement.payment_plan as { description?: string })?.description || 'No description available'}
          </p>
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        <p>
          Paid Amount: {formatCurrency(totalPaid)} /{" "}
          {formatCurrency(settlement.total_amount)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRecordPayment(settlement.id)}
        >
          Record Payment
        </Button>
        {settlement.receipt_url && (
          <ReceiptViewer
            url={settlement.receipt_url}
            fileName="Settlement Receipt"
          />
        )}
      </div>
      {settlement.settlement_payments?.length > 0 && (
        <PaymentHistory payments={settlement.settlement_payments} />
      )}
    </div>
  );
};

interface PaymentHistoryProps {
  payments: any[];
}

const PaymentHistory = ({ payments }: PaymentHistoryProps) => (
  <div className="text-sm">
    <p className="font-medium">Payment History:</p>
    <div className="space-y-2 mt-2">
      {payments.map((payment: any) => (
        <div
          key={payment.id}
          className="flex justify-between items-center bg-muted/50 p-2 rounded"
        >
          <div>
            <p>{format(new Date(payment.payment_date), "PPP")}</p>
            <p className="text-muted-foreground">
              {formatCurrency(payment.amount)}
            </p>
          </div>
          {payment.receipt_url && (
            <ReceiptViewer
              url={payment.receipt_url}
              fileName={`Payment Receipt - ${format(
                new Date(payment.payment_date),
                "PPP"
              )}`}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);