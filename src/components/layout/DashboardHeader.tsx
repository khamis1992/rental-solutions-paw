import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 h-14 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <SearchBox />
        </div>
        <div className="flex items-center gap-2">
          <NotificationsButton />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};