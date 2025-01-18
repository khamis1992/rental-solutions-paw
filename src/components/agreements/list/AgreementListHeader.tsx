import { Button } from "@/components/ui/button";
import { FileUp, FilePlus2, Trash2 } from "lucide-react";
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
    <div className="flex justify-between items-start">
      <h1 className="text-3xl font-bold">Agreements</h1>
      <div className="flex flex-col gap-2">
        <CreateAgreementDialog>
          <Button variant="default" className="w-full flex items-center">
            <FilePlus2 className="h-4 w-4 mr-2" />
            Create Agreement
          </Button>
        </CreateAgreementDialog>
        <Button
          variant="outline"
          onClick={onImportClick}
          className="w-full flex items-center"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Import Agreements
        </Button>
        <Button
          variant="destructive"
          onClick={onDeleteClick}
          disabled={isDeleting}
          className="w-full flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All
        </Button>
      </div>
    </div>
  );
};