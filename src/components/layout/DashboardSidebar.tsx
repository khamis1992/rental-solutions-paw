"use client";

import { Home, Users, FileText, BarChart2, Calendar, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidebarProps } from "@/components/ui/sidebar/types";

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: BarChart2, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
];

export const DashboardSidebar = ({ open, onOpenChange }: SidebarProps) => {
  const location = useLocation();

  return (
    <Sidebar className="fixed inset-y-0 left-0 z-50">
      <SidebarContent>
        <div className="flex h-14 items-center border-b px-6">
          <span className="font-semibold">Customer Manager</span>
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
                    <a
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2",
                        location.pathname === item.href && "text-primary"
                      )}
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