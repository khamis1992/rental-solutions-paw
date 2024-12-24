import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationsButton } from "./NotificationsButton";
import { SearchBox } from "./SearchBox";
import { LanguageSwitcher } from "./LanguageSwitcher";

export const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <SearchBox />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <NotificationsButton />
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};