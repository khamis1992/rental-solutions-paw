import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
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
      </div>
    </div>
  );
};