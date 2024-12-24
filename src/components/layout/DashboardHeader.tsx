import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificationsButton } from "./NotificationsButton";
import { UserProfileMenu } from "./UserProfileMenu";

export const DashboardHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-[var(--header-height,56px)]">
        <div className="flex h-full items-center justify-end gap-2 px-2 md:gap-4 md:px-4">
          <NotificationsButton />
          <Button 
            variant="ghost" 
            size="icon"
            className="h-9 w-9 md:h-10 md:w-10"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
};