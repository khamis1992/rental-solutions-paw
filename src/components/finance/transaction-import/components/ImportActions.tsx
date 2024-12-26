import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Upload } from "lucide-react";

interface ImportActionsProps {
  onImportClick: () => void;
  onDeleteAll: () => void;
  isUploading: boolean;
  hasTransactions: boolean;
}

export const ImportActions = ({
  onImportClick,
  onDeleteAll,
  isUploading,
  hasTransactions
}: ImportActionsProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <Button onClick={onImportClick} disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </>
        )}
      </Button>

      {hasTransactions && (
        <Button variant="destructive" onClick={onDeleteAll} disabled={isUploading}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete All
        </Button>
      )}
    </div>
  );
};