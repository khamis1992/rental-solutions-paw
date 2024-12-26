import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Calculator,
  Wrench,
  HelpCircle,
  Settings,
  Scale,
  AlertTriangle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  companyName?: string;
  logoUrl?: string;
}

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/vehicles", label: "Vehicles", icon: Car },
  { href: "/agreements", label: "Agreements", icon: FileText },
  { href: "/finance", label: "Finance", icon: Calculator },
  { href: "/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/legal", label: "Legal", icon: Scale },
  { href: "/traffic-fines", label: "Traffic Fines", icon: AlertTriangle },
  { href: "/help", label: "Help", icon: HelpCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  companyName,
  logoUrl,
}) => {
  const navigate = useNavigate();

  if (!isOpen) {
    return null;
  }

  return (
    <Sidebar className="border-r border-border/40 bg-sidebar backdrop-blur-xl">
      <SidebarContent>
        <div className="flex h-16 items-center border-b border-border/40 px-6 bg-sidebar-accent/5">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={`${companyName} Logo`}
              className="h-8 w-auto mr-3 transition-transform hover:scale-105" 
            />
          ) : (
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">
                {companyName?.charAt(0) || 'R'}
              </span>
            </div>
          )}
          <span className="font-semibold text-sidebar-primary tracking-tight">
            {companyName || 'Rental Solutions'}
          </span>
        </div>
        
        <div className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 hover:bg-sidebar-accent/10 text-sidebar-foreground group"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(item.href);
                        }}
                      >
                        <item.icon className="h-4 w-4 text-sidebar-primary/70 group-hover:text-sidebar-primary transition-colors" />
                        <span className="font-medium text-sm">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};