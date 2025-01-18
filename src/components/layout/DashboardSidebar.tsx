import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Scale,
  AlertTriangle,
  Receipt,
  FileStack,
} from "lucide-react";

export const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Car, label: "Vehicles", path: "/vehicles" },
    { icon: Users, label: "Customers", path: "/customers" },
    { icon: FileText, label: "Agreements", path: "/agreements" },
    { icon: Scale, label: "Legal", path: "/legal" },
    { icon: AlertTriangle, label: "Traffic Fines", path: "/traffic-fines" },
    { icon: Receipt, label: "Finance", path: "/finance" },
    { icon: FileStack, label: "Reports", path: "/reports" },
    { icon: HelpCircle, label: "Help", path: "/help" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <Sidebar className="border-r border-border/50 bg-white shadow-sm">
      <SidebarHeader className="h-[var(--header-height)] flex items-center px-6 border-b">
        <span className="font-semibold text-lg">Rental Solutions</span>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary hover:bg-primary/15"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
};