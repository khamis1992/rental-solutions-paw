
import { useEffect, useState } from "react";
import { WifiOff, RefreshCw, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function OfflinePage() {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cachedResources, setCachedResources] = useState<string[]>([]);

  useEffect(() => {
    // Check for cached resources
    const checkCache = async () => {
      try {
        const cacheNames = await caches.keys();
        const resources: string[] = [];
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          resources.push(...keys.map(key => key.url));
        }
        
        setCachedResources(resources);
      } catch (error) {
        console.error('Error checking cache:', error);
      }
    };
    
    checkCache();
  }, []);

  const handleRetry = async () => {
    setIsChecking(true);
    setProgress(0);
    
    try {
      // Simulate progress while checking connection
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Try to fetch a small resource to test connection
      await fetch('/ping');
      
      clearInterval(interval);
      setProgress(100);
      
      // Reload after a short delay to show 100% progress
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      setIsChecking(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <WifiOff className="mx-auto h-12 w-12 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">You're Offline</h1>
          <p className="mt-2 text-muted-foreground">
            Please check your internet connection and try again
          </p>
        </div>

        {isChecking ? (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Checking connection...
            </p>
          </div>
        ) : (
          <Button
            onClick={handleRetry}
            className="w-full gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}

        {cachedResources.length > 0 && (
          <div className="mt-8 rounded-lg border bg-card p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              Available Offline
            </div>
            <div className="mt-2 max-h-32 overflow-y-auto">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {cachedResources.slice(0, 5).map((resource, index) => (
                  <li key={index} className="truncate">
                    {new URL(resource).pathname}
                  </li>
                ))}
                {cachedResources.length > 5 && (
                  <li className="text-center">
                    +{cachedResources.length - 5} more resources
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          Some features may be available offline
        </p>
      </div>
    </div>
  );
}
