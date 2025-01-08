interface AgreementFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export const AgreementFilters = ({
  onSearchChange,
  onStatusChange,
  onSortChange,
}: AgreementFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
      {/* Empty container maintained for layout consistency */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center"></div>
    </div>
  );
};