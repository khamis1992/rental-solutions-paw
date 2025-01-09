import { Agreement } from "@/types/agreement.types";

interface AgreementDetailsTabProps {
  agreement: Agreement;
}

export const AgreementDetailsTab = ({ agreement }: AgreementDetailsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Agreement Number</h3>
          <p>{agreement.agreement_number}</p>
        </div>
        <div>
          <h3 className="font-medium">Status</h3>
          <p>{agreement.status}</p>
        </div>
        <div>
          <h3 className="font-medium">Start Date</h3>
          <p>{new Date(agreement.start_date).toLocaleDateString()}</p>
        </div>
        <div>
          <h3 className="font-medium">End Date</h3>
          <p>{new Date(agreement.end_date).toLocaleDateString()}</p>
        </div>
        <div>
          <h3 className="font-medium">Rent Amount</h3>
          <p>{agreement.rent_amount} QAR</p>
        </div>
      </div>
    </div>
  );
};