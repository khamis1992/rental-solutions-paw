import { Button } from "@/components/ui/button";
import { FileUp, Trash2 } from "lucide-react";
import { CreateAgreementDialog } from "../CreateAgreementDialog";

interface AgreementListHeaderProps {
  onImportClick: () => void;
  onDeleteClick: () => void;
  isDeleting: boolean;
}

export const AgreementListHeader = ({ 
  onImportClick, 
  onDeleteClick, 
  isDeleting 
}: AgreementListHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold">Agreements</h1>
      <div className="flex items-center gap-3">
        <CreateAgreementDialog />
        <Button
          variant="outline"
          onClick={onImportClick}
          className="flex items-center"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Import Agreements
        </Button>
        <Button
          variant="destructive"
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All
        </Button>
      </div>
    </div>
  );
};