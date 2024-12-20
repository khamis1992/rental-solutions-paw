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
      <div className="container mx-auto h-14"> {/* Reduced height from h-16 to h-14 */}
        <div className="flex h-full items-center justify-between gap-4 px-2"> {/* Added gap-4 and px-2 for better spacing */}
          <SearchBox />

          <div className="flex items-center space-x-3"> {/* Changed gap-2 to space-x-3 for more consistent spacing */}
            <NotificationsButton />
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9" /* Adjusted button size for better proportions */
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