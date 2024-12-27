import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImportProgressProps {
  isUploading: boolean;
  progress: number;
}

export const ImportProgress = ({ isUploading, progress }: ImportProgressProps) => {
  if (!isUploading) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Importing payments...
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
};