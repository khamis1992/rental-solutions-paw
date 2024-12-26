import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationsButton } from "./NotificationsButton";
import { SearchBox } from "./SearchBox";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  companyName?: string;
}

export const DashboardHeader = ({ isSidebarOpen, onToggleSidebar, companyName }: DashboardHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 hover:bg-accent/10"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex items-center space-x-4">
            <SearchBox />
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationsButton />
            <div className="h-5 w-px bg-border/40" /> {/* Separator */}
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};