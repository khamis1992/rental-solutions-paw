import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { AgreementStatus } from "@/components/agreements/details/AgreementStatus";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface AgreementHeaderProps {
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
  onCreate: () => void;
  onImport: () => void;
}

export const AgreementHeader = ({ agreement, remainingAmount, onCreate, onImport }: AgreementHeaderProps) => {
  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Agreement Number</Label>
            <p className="text-lg font-semibold">{agreement.agreement_number}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Status</Label>
            <div className="flex items-center space-x-2">
              <AgreementStatus 
                agreementId={agreement.id} 
                currentStatus={agreement.status} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                {formatDateToDisplay(agreement.start_date)} - {formatDateToDisplay(agreement.end_date)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Rent Amount</Label>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(remainingAmount?.rent_amount || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Contract Value</Label>
            <p className="text-lg font-semibold">
              {formatCurrency(remainingAmount?.final_price || 0)}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Remaining Amount</Label>
            <p className="text-lg font-semibold text-blue-600">
              {formatCurrency(remainingAmount?.remaining_amount || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
