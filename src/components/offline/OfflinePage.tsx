
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center">
        <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-semibold">You're Offline</h1>
        <p className="mt-2 text-muted-foreground">
          Please check your internet connection and try again
        </p>
        <div className="mt-6">
          <Button onClick={handleRetry} className="min-w-[200px]">
            Try Again
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Some features may be available offline
        </p>
      </div>
    </div>
  );
}
