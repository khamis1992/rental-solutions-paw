import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14">
        <div className="flex h-full items-center justify-between gap-4 px-4">
          <SearchBox />

          <div className="flex items-center space-x-3">
            <NotificationsButton />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9"
              onClick={() => navigate("/settings")}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <UserProfileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};