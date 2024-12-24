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
  { icon: Settings, label: "Settings", href: "/settings" }
];

export const DashboardSidebar = () => {
  const isMobile = useIsMobile();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex h-14 items-center border-b px-6">
          <span className="font-semibold">Rental Solutions</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {baseMenuItems.map((item) => (
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