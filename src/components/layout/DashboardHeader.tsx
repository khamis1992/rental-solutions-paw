
import { Settings, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";
import { useSidebar } from "@/components/ui/sidebar";

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto h-[var(--header-height,56px)]">
        <div className="flex h-full items-center justify-between gap-2 md:gap-4 px-4">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={toggleSidebar}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="font-semibold text-lg hidden md:block hover:text-primary transition-colors">
              Rental Solution
            </div>
            <div className="flex-1 md:flex-none">
              <SearchBox />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <NotificationsButton />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 hover:bg-primary/10 transition-colors"
              onClick={() => navigate("/settings")}
              aria-label="Settings"
            >
              <Settings className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
