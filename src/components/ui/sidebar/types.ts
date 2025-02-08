
export type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  isOpen: boolean;
  setOpen: (open: boolean | ((value: boolean) => boolean)) => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  toggleSidebar: () => void;
  toggle: () => void;
  close: () => void;
};

export interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

