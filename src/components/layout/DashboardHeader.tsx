import { UserProfileMenu } from "./UserProfileMenu";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { LanguageToggle } from "./LanguageToggle";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function DashboardHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <SearchBox placeholder={t('common.search')} />
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <NotificationsButton />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}