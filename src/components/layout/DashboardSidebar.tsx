import { Home, Car, Users, FileText, Settings, HelpCircle, Wrench, FilePen, BarChart3, Gavel, Wallet } from "lucide-react";
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

const baseMenuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Car, label: "Vehicles", href: "/vehicles" },
  { icon: Wrench, label: "Maintenance", href: "/maintenance" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: FilePen, label: "Agreements", href: "/agreements" },
  { icon: Wallet, label: "Finance", href: "/finance" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Gavel, label: "Legal", href: "/legal" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

const settingsMenuItem = { icon: Settings, label: "Settings", href: "/settings" };

export const DashboardSidebar = () => {
  const [menuItems, setMenuItems] = useState(baseMenuItems);
  const navigate = useNavigate();
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();

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

    checkSession();
  }, [session, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <Sidebar>
        <SidebarContent>
          <div className="flex h-14 items-center border-b px-6">
            <span className="font-semibold">Rental Solutions</span>
          </div>
          <div className="p-4">Loading...</div>
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