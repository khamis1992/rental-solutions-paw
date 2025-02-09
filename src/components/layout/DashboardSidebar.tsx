
import { 
  Home, Car, Users, FileText, HelpCircle, Wrench, 
  FilePen, BarChart3, Gavel, Wallet, FileText as AuditIcon,
  AlertTriangle, DollarSign, MapPin, ChevronDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { cn } from "@/lib/utils";

const menuGroups = {
  core: {
    label: "Core Operations",
    items: [
      { icon: Home, label: "Dashboard", href: "/" },
      { icon: Car, label: "Vehicles", href: "/vehicles" },
      { icon: Users, label: "Customers", href: "/customers" },
    ]
  },
  operations: {
    label: "Operations",
    items: [
      { icon: FilePen, label: "Agreements", href: "/agreements" },
      { icon: Wrench, label: "Maintenance", href: "/maintenance" },
      { icon: MapPin, label: "Chauffeur Service", href: "/chauffeur-service" },
    ]
  },
  financial: {
    label: "Financial",
    items: [
      { icon: Wallet, label: "Finance", href: "/finance" },
      { icon: DollarSign, label: "Remaining Amount", href: "/remaining-amount" },
      { icon: AlertTriangle, label: "Traffic Fines", href: "/traffic-fines" },
    ]
  },
  reporting: {
    label: "Analytics & Reports",
    items: [
      { icon: BarChart3, label: "Reports", href: "/reports" },
      { icon: AuditIcon, label: "Audit", href: "/audit" },
    ]
  },
  support: {
    label: "Support & Legal",
    items: [
      { icon: Gavel, label: "Legal", href: "/legal" },
      { icon: HelpCircle, label: "Help", href: "/help" },
    ]
  }
};

export const DashboardSidebar = () => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('sidebarGroups');
    return saved ? JSON.parse(saved) : Object.keys(menuGroups).reduce((acc, key) => ({ ...acc, [key]: true }), {});
  });
  
  const location = useLocation();
  const { session, isLoading } = useSessionContext();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem('sidebarGroups', JSON.stringify(expandedGroups));
  }, [expandedGroups]);

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  if (isLoading) {
    return (
      <Sidebar className="animate-pulse">
        <SidebarContent>
          <div className="flex h-14 items-center border-b px-6">
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded w-full" />
            ))}
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <div className="flex h-14 items-center border-b px-6">
          <span className="font-semibold tracking-tight">Rental Solutions</span>
        </div>
        
        <div className="px-2 py-2">
          {Object.entries(menuGroups).map(([key, group]) => (
            <SidebarGroup key={key} className="py-2">
              <button
                onClick={() => toggleGroup(key)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{group.label}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    expandedGroups[key] ? "transform rotate-180" : ""
                  )}
                />
              </button>
              
              {expandedGroups[key] && (
                <SidebarGroupContent className="animate-accordion-down">
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                          >
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
                                isActive 
                                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                              )}
                            >
                              <item.icon className={cn(
                                "h-4 w-4 transition-transform group-hover:scale-110",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
