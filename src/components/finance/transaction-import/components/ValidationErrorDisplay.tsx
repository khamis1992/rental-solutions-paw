import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationErrorDisplayProps {
  errors: Array<{
    row: number;
    message: string;
    content?: string;
  }>;
}

export const ValidationErrorDisplay = ({ errors }: ValidationErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      <div className="space-y-2">
        {errors.map((error, index) => (
          <Alert key={index} variant="destructive">
            <AlertTitle>Row {error.row}</AlertTitle>
            <AlertDescription className="mt-2">
              <div>{error.message}</div>
              {error.content && (
                <div className="mt-2 text-sm font-mono bg-secondary/50 p-2 rounded">
                  {error.content}
                </div>
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </ScrollArea>
  );
};