import { formatCurrency } from "@/lib/utils";
import { LeaseStatus } from "@/types/agreement.types";

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
  remainingAmount: number;
}

export const AgreementHeader = ({ agreement, remainingAmount }: AgreementHeaderProps) => {
  if (!agreement) return null;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">
          Agreement #{agreement.agreement_number}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Contract Value:</span>
          <span className="ml-2 font-medium">{formatCurrency(agreement.contractValue)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Rent Amount:</span>
          <span className="ml-2 font-medium">{formatCurrency(agreement.rent_amount)}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Balance:</span>
          <span className="ml-2 font-medium">{formatCurrency(remainingAmount)}</span>
        </div>
      </div>
    </div>
  );
};