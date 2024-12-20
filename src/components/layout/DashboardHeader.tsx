import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16">
        <div className="flex h-16 items-center justify-between">
          <SearchBox />

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
      </div>
    </header>
  );
};