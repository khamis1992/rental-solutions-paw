import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotosDialogProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PhotosDialog = ({ images, open, onOpenChange }: PhotosDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Inspection Photos</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Inspection photo ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);