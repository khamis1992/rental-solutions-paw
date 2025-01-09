interface AgreementDocumentsTabProps {
  agreementId: string;
}

export const AgreementDocumentsTab = ({ agreementId }: AgreementDocumentsTabProps) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4">Documents</h3>
      {/* Documents list will be implemented here */}
    </div>
  );
};