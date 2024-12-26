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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  companyName?: string;
  logoUrl?: string;
}

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

export const DashboardSidebar = ({ isOpen, onToggle, companyName, logoUrl }: DashboardSidebarProps) => {
  const [menuItems, setMenuItems] = useState(baseMenuItems);
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
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
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
      } catch (error) {
        console.error('Error checking user role:', error);
        toast({
          title: "Error",
          description: "Could not verify user permissions",
          variant: "destructive",
        });
        setMenuItems(baseMenuItems);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (event === 'SIGNED_IN') {
        checkSession();
      }
    });

    // Initial check
    checkSession();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [session, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <Sidebar className="animate-pulse">
        <SidebarContent>
          <div className="flex h-14 items-center border-b border-border/40 px-6">
            <div className="h-8 w-32 rounded bg-muted"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-muted"></div>
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex h-14 items-center border-b border-border/40 px-6 bg-sidebar-accent/5">
          {logoUrl && (
            <img src={logoUrl} alt="Company Logo" className="h-8 w-auto mr-2" />
          )}
          <span className="font-semibold text-sidebar-primary">{companyName || 'Rental Solutions'}</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent/10 text-sidebar-foreground"
                    >
                      <item.icon className="h-4 w-4 text-sidebar-primary" />
                      <span className="font-medium">{item.label}</span>
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