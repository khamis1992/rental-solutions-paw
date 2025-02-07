
import { VariantProps } from "class-variance-authority";
import { sidebarMenuButtonVariants } from "./variants";

export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  toggle: () => void;
  close: () => void;
};

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

export interface SidebarMenuButtonProps extends 
  React.ComponentProps<"button">,
  VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<any>;
}
