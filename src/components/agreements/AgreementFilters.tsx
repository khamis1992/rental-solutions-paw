interface AgreementFiltersProps {
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const AgreementFilters = ({
  onStatusChange,
  onSortChange,
}: AgreementFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      {/* Empty for now - will be used for other filters if needed */}
    </div>
  );
};