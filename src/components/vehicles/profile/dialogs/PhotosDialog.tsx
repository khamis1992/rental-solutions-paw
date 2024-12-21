import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PhotosDialogProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotosDialog = ({ images, open, onOpenChange }: PhotosDialogProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <div className="relative">
          {images.length > 0 ? (
            <>
              <div className="relative h-[500px] w-full">
                <img
                  src={images[currentIndex]}
                  alt={`Photo ${currentIndex + 1}`}
                  className="h-full w-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    className="rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    className="rounded-full bg-background/80 backdrop-blur-sm"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="mt-2 text-center text-sm text-muted-foreground">
                Photo {currentIndex + 1} of {images.length}
              </div>
            </>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">
              No photos available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};