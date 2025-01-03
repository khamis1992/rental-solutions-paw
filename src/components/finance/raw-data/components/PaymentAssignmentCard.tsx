import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { PaymentAssignmentResult } from "@/components/finance/types/transaction.types";

interface PaymentAssignmentCardProps {
  totalAmount: number;
  assignmentResults: PaymentAssignmentResult[];
}

export const PaymentAssignmentCard = ({ totalAmount, assignmentResults }: PaymentAssignmentCardProps) => {
  return (
    <Card className="bg-muted/50 mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Remaining Unassigned Amount</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{formatCurrency(totalAmount)}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Total amount from unprocessed payments
        </p>
        {assignmentResults.length > 0 && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Recent Assignments:</h4>
            <ul className="space-y-1 text-sm">
              {assignmentResults.map((result, index) => (
                <li key={index} className="flex justify-between">
                  <span>Agreement {result.agreementNumber}:</span>
                  <span>{formatCurrency(result.amountAssigned)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};