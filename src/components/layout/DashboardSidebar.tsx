import { 
  Home, Car, Users, FileText, Settings, 
  HelpCircle, Wrench, FilePen, BarChart3, 
  Gavel, Wallet, FileText as AuditIcon,
  AlertTriangle, DollarSign, MapPin
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
import { useToast } from "@/hooks/use-toast";
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
  { icon: MapPin, label: "Chauffeur Service", href: "/chauffeur-service" },
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
    <Sidebar className="border-r border-border bg-white shadow-sm w-64">
      <SidebarContent>
        <div className="flex h-16 items-center border-b px-6 bg-primary">
          <span className="font-semibold text-lg text-white">Rental Solutions</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.href}
                      className={`flex items-center gap-4 px-6 py-3.5 rounded-lg transition-all duration-200 ${
                        location.pathname === item.href
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-primary'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${
                        location.pathname === item.href
                          ? 'text-primary'
                          : 'text-gray-500'
                      }`} />
                      <span className="text-base whitespace-nowrap">{item.label}</span>
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