import { Home, Car, Users, FileText, Settings, HelpCircle, Wrench, FilePen, BarChart3, Gavel, Wallet, FileText as AuditIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const baseMenuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Car, label: "Vehicles", href: "/vehicles" },
  { icon: Wrench, label: "Maintenance", href: "/maintenance" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: FilePen, label: "Agreements", href: "/agreements" },
  { icon: Wallet, label: "Finance", href: "/finance" },
  { icon: AuditIcon, label: "Audit", href: "/audit" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Gavel, label: "Legal", href: "/legal" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

const settingsMenuItem = { icon: Settings, label: "Settings", href: "/settings" };

export const DashboardSidebar = () => {
  const [menuItems, setMenuItems] = useState(baseMenuItems);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkSession = async () => {
      if (isLoading) return;

      if (!session) {
        navigate('/auth');
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          setError('Could not fetch user profile');
          toast({
            title: "Error",
            description: "Could not fetch user profile",
            variant: "destructive",
          });
          return;
        }

        if (profile?.role === 'admin') {
          setMenuItems([...baseMenuItems, settingsMenuItem]);
        } else {
          setMenuItems(baseMenuItems);
        }
        setError(null);
      } catch (error) {
        console.error('Error checking user role:', error);
        setError('Could not verify user permissions');
        toast({
          title: "Error",
          description: "Could not verify user permissions",
          variant: "destructive",
        });
        setMenuItems(baseMenuItems);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        checkSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-semibold">Rental Solutions</span>
          </div>
          <div className="flex items-center justify-center h-[calc(100vh-3.5rem)] animate-pulse">
            <span className="text-muted-foreground">Loading menu...</span>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-semibold">Rental Solutions</span>
          </div>
          <div className="p-4 text-destructive">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex h-14 items-center border-b px-6">
          <span className="font-semibold">Rental Solutions</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.href}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};