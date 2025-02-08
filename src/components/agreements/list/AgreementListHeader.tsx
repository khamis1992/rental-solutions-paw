
import { Button } from "@/components/ui/button";
import { FilePlus2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "flex justify-between items-start",
      "w-full mb-6"
    )}>
      <h1 className={cn(
        "text-3xl font-bold",
        "text-foreground"
      )}>
        Agreements
      </h1>
    </div>
  );
};
