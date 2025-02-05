import { LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function UserProfileMenu() {
  const navigate = useNavigate();
  const { t, dir } = useTranslation();
  const isRTL = dir() === 'rtl';

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <User className="h-4 w-4" />
          <span className="sr-only">{t('common.userMenu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className={isRTL ? 'rtl' : ''}>
        <DropdownMenuItem onClick={handleSignOut} className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <LogOut className="h-4 w-4" />
          <span>{t('auth.signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}