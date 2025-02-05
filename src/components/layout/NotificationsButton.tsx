import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function NotificationsButton() {
  const { t, dir } = useTranslation();
  const isRTL = dir() === 'rtl';

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9">
      <Bell className="h-4 w-4" />
      <span className="sr-only">{t('common.notifications')}</span>
    </Button>
  );
}