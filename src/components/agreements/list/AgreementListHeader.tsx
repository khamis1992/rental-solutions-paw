import { Button } from "@/components/ui/button";
import { FileUp, Trash2 } from "lucide-react";
import { CreateAgreementDialog } from "../CreateAgreementDialog";
import { useState } from "react";

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
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="flex justify-between items-start">
      <h1 className="text-3xl font-bold">Agreements</h1>
      <div className="flex flex-col gap-2">
        <CreateAgreementDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
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