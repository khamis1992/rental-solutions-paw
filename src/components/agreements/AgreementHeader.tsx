import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeaseStatus } from "@/types/agreement.types";
import { formatCurrency } from "@/lib/utils";

export interface AgreementHeaderProps {
  agreement?: {
    id: string;
    agreement_number: string;
    status: LeaseStatus;
    start_date: string;
    end_date: string;
    rent_amount: number;
    contractValue?: number;
  };
  remainingAmount?: number;
  onCreate: () => void;
  onImport: () => void;
}

export const AgreementHeader = ({
  agreement,
  remainingAmount = 0,
  onImport,
}: AgreementHeaderProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {agreement ? `Agreement #${agreement.agreement_number}` : 'Agreements'}
            </h2>
            {agreement && (
              <Badge
                variant={agreement.status === "active" ? "success" : "secondary"}
                className="mb-4"
              >
                {agreement.status}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onImport}>
              Import Invoice
            </Button>
          </div>
        </div>

        {agreement && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {agreement.start_date
                  ? new Date(agreement.start_date).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {agreement.end_date
                  ? new Date(agreement.end_date).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rent Amount</p>
              <p className="font-medium">{formatCurrency(agreement.rent_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Contract Value</p>
              <p className="font-medium">{formatCurrency(agreement.contractValue || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Remaining Amount</p>
              <p className="font-medium text-red-600">{formatCurrency(remainingAmount)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};