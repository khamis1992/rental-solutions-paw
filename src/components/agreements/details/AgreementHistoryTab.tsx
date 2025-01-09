interface AgreementHistoryTabProps {
  agreementId: string;
}

export const AgreementHistoryTab = ({ agreementId }: AgreementHistoryTabProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Agreement History</h3>
      {/* History list will be implemented here */}
    </div>
  );
};