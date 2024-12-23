import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";
import { LanguageToggle } from "./LanguageToggle";

export const DashboardHeader = () => {
  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
      <SearchBox />
      <div className="ml-auto flex items-center gap-4">
        <LanguageToggle />
        <NotificationsButton />
        <UserProfileMenu />
      </div>
    </header>
  );
};