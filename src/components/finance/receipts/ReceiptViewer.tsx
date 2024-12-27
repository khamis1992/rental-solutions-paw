import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, Download, ExternalLink } from "lucide-react";

interface ReceiptViewerProps {
  url: string;
  fileName: string;
}

export const ReceiptViewer = ({ url, fileName }: ReceiptViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  const isPDF = url.toLowerCase().endsWith('.pdf');

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
        <Maximize2 className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex justify-end gap-2 mb-4">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          </div>

          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {isPDF ? (
              <iframe
                src={url}
                className="w-full h-full"
                title="Receipt PDF"
              />
            ) : (
              <img
                src={url}
                alt="Receipt"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};