import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  companyName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 hover:bg-accent/10 transition-colors"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        
        <div className="flex flex-1 items-center justify-between space-x-4">
          <div className="flex-1 lg:max-w-2xl">
            <SearchBox />
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationsButton />
            <div className="h-6 w-px bg-border/40" aria-hidden="true" />
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};