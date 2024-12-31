import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";

interface DocumentHeaderProps {
  customerName?: string;
  onPrint: () => void;
}

export function DocumentHeader({ customerName, onPrint }: DocumentHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Legal Document - {customerName}</span>
        </div>
        <Button onClick={onPrint} className="print:hidden">
          <Printer className="h-4 w-4 mr-2" />
          Print Document
        </Button>
      </DialogTitle>
    </DialogHeader>
  );
}