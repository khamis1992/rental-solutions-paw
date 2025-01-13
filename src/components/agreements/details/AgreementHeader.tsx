import { formatCurrency } from "@/lib/utils";
import { LeaseStatus } from "@/types/agreement.types";
import { Badge } from "@/components/ui/badge";

interface AgreementHeaderProps {
  agreement?: {
    id: string;
    agreement_number: string;
    status: LeaseStatus;
    start_date: string;
    end_date: string;
    rent_amount: number;
    contractValue: number;
    remainingAmount: number;
  };
  remainingAmount?: number;
}

export const AgreementHeader = ({ agreement, remainingAmount }: AgreementHeaderProps) => {
  if (!agreement) return null;

  const amountPaid = agreement.contractValue - (remainingAmount || 0);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Agreement #{agreement.agreement_number}
        </h2>
        <Badge 
          variant="outline" 
          className={
            agreement.status === 'active' 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
          }
        >
          {agreement.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Contract Value</p>
          <p className="text-lg font-semibold">{formatCurrency(agreement.contractValue)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Amount Paid</p>
          <p className="text-lg font-semibold">{formatCurrency(amountPaid)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Remaining Amount</p>
          <p className="text-lg font-semibold">{formatCurrency(remainingAmount || 0)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Monthly Rent</p>
          <p className="text-lg font-semibold">{formatCurrency(agreement.rent_amount)}</p>
        </div>
      </div>
    </div>
  );
};