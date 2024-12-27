import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";

interface ReceiptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string;
}

export const ReceiptViewer = ({ isOpen, onClose, receiptUrl }: ReceiptViewerProps) => {
  const isPDF = receiptUrl.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Receipt Viewer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(receiptUrl, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={receiptUrl} download>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </div>
          <div className="relative h-[600px] w-full border rounded-lg overflow-hidden">
            {isPDF ? (
              <iframe
                src={`${receiptUrl}#toolbar=0`}
                className="w-full h-full"
                title="Receipt PDF Viewer"
              />
            ) : (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};