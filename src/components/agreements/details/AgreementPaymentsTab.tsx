interface AgreementPaymentsTabProps {
  agreementId: string;
}

export const AgreementPaymentsTab = ({ agreementId }: AgreementPaymentsTabProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Payment History</h3>
      {/* Payment history will be implemented here */}
    </div>
  );
};