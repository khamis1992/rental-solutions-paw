import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface CaseDetailsProps {
  legalCase: any; // Type will be inferred from the query
}

export const CaseDetails = ({ legalCase }: CaseDetailsProps) => {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Customer Details</h3>
            <p className="text-sm text-muted-foreground">
              {legalCase.customer?.full_name}
            </p>
            <p className="text-sm text-muted-foreground">
              {legalCase.customer?.phone_number}
            </p>
            <p className="text-sm text-muted-foreground">
              {legalCase.customer?.email}
            </p>
          </div>
          <div>
            <h3 className="font-medium">Case Information</h3>
            <p className="text-sm text-muted-foreground">
              Type: {legalCase.case_type}
            </p>
            <p className="text-sm text-muted-foreground">
              Amount Owed: {formatCurrency(legalCase.amount_owed)}
            </p>
            <p className="text-sm text-muted-foreground">
              Created: {format(new Date(legalCase.created_at), "PPP")}
            </p>
          </div>
        </div>
        {legalCase.description && (
          <div>
            <h3 className="font-medium">Description</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {legalCase.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};