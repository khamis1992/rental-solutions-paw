import { 
  Home, Car, Users, FileText, Settings, 
  HelpCircle, Wrench, FilePen, BarChart3, 
  Gavel, Wallet, FileText as AuditIcon,
  AlertTriangle, DollarSign
} from "lucide-react";
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
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  { icon: AlertTriangle, label: "Traffic Fines", href: "/traffic-fines" },
  { icon: DollarSign, label: "Remaining Amount", href: "/remaining-amount" },
  { icon: Wallet, label: "Finance", href: "/finance" },
  { icon: AuditIcon, label: "Audit", href: "/audit" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Gavel, label: "Legal", href: "/legal" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

const settingsMenuItem = { icon: Settings, label: "Settings", href: "/settings" };

export const DashboardSidebar = () => {
  const [menuItems, setMenuItems] = useState(baseMenuItems);
  const location = useLocation();
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const checkSession = async () => {
      if (isLoading) return;

      if (!session) {
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
  }, [session, isLoading, toast]);

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
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors ${
                        location.pathname === item.href
                          ? 'bg-[#FFA500] text-white'
                          : 'text-black hover:bg-[#F5F5F5] hover:text-[#FFA500]'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${
                        location.pathname === item.href
                          ? 'text-white'
                          : 'text-current'
                      }`} />
                      <span>{item.label}</span>
                    </Link>
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