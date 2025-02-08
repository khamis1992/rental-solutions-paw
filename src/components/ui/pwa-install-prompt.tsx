
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast.success('Installing app...');
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast.error('Failed to install app');
    }
  };

  if (!showInstallButton) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      className="fixed bottom-4 right-4 z-50 shadow-lg"
    >
      Install App
    </Button>
  );
};
