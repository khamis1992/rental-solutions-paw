import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { AgreementStatus } from "./AgreementStatus";

interface AgreementHeaderProps {
  agreement: {
    id: string;
    agreement_number: string;
    status: string;
    start_date: string;
    end_date: string;
  };
}

export const AgreementHeader = ({ agreement }: AgreementHeaderProps) => {
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
        </div>
      </CardContent>
    </Card>
  );
};