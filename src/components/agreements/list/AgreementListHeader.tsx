import { Button } from "@/components/ui/button";
import { FileUp, Trash2 } from "lucide-react";

interface AgreementListHeaderProps {
  onImportClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export const AgreementListHeader = ({
  onImportClick,
  onDeleteClick,
  isDeleting,
}: AgreementListHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold tracking-tight">Agreements</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onImportClick}
          className="flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          Import
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Deleting..." : "Delete All"}
        </Button>
      </div>
    </div>
  );
};