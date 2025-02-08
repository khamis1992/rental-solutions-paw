import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";

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
    </div>
  );
};