import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { AgreementStatus } from "@/components/agreements/details/AgreementStatus";
import { formatCurrency } from "@/lib/utils";

// Define the LeaseStatus type to match our database schema
type LeaseStatus = "pending_payment" | "pending_deposit" | "active" | "closed" | "terminated" | "cancelled";

interface AgreementHeaderProps {
  agreement: {
    id: string;
    agreement_number: string;
    status: LeaseStatus;
    start_date: string;
    end_date: string;
    rent_amount: number;
  };
  remainingAmount?: {
    rent_amount: number;
    final_price: number;
    remaining_amount: number;
  } | null;
}

export const AgreementHeader = ({ agreement, remainingAmount }: AgreementHeaderProps) => {
  console.log("Agreement data:", agreement);
  console.log("Remaining amount data:", remainingAmount);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Agreement Number</Label>
            <p className="text-lg font-medium">{agreement.agreement_number}</p>
          </div>
          <div>
            <Label>Status</Label>
            <AgreementStatus 
              agreementId={agreement.id} 
              currentStatus={agreement.status} 
            />
          </div>
          <div>
            <Label>Start Date</Label>
            <p>{formatDateToDisplay(agreement.start_date)}</p>
          </div>
          <div>
            <Label>End Date</Label>
            <p>{formatDateToDisplay(agreement.end_date)}</p>
          </div>
          <div>
            <Label>Rent Amount</Label>
            <p className="text-lg font-medium">
              {formatCurrency(remainingAmount?.rent_amount || 0)}
            </p>
          </div>
          <div>
            <Label>Contract Value</Label>
            <p className="text-lg font-medium">
              {formatCurrency(remainingAmount?.final_price || 0)}
            </p>
          </div>
          <div>
            <Label>Remaining Amount</Label>
            <p className="text-lg font-medium">
              {formatCurrency(remainingAmount?.remaining_amount || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};