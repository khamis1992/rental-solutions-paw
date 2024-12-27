interface CategoryTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export function CategoryTableHeader({ onSelectAll, allSelected }: CategoryTableHeaderProps) {
  return (
    <thead className="bg-muted/50">
      <tr>
        <th className="w-[50px] p-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="h-4 w-4"
          />
        </th>
        <th className="text-left p-2">Name</th>
        <th className="text-left p-2">Type</th>
        <th className="text-left p-2">Budget</th>
        <th className="text-left p-2">Period</th>
        <th className="text-left p-2">Status</th>
        <th className="text-right p-2">Actions</th>
      </tr>
    </thead>
  );
}