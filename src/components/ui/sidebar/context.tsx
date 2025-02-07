
'use client';

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { SidebarContext, SidebarProviderProps } from "./types";

const SidebarContext = React.createContext<SidebarContext | null>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  ({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [_open, _setOpen] = React.useState(defaultOpen);
    
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `sidebar:state=${openState}; path=/; max-age=${60 * 60 * 24 * 7}`;
      },
      [setOpenProp, open]
    );

    const toggle = React.useCallback(() => {
      return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
    }, [isMobile, setOpen]);

    const close = React.useCallback(() => {
      isMobile ? setOpenMobile(false) : setOpen(false);
    }, [isMobile, setOpen]);

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
    }, [isMobile, setOpen]);

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        isOpen: open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
        toggle,
        close,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, toggle, close]
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            ref={ref}
            style={{
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "3rem",
              ...style,
            } as React.CSSProperties}
            className="group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);

SidebarProvider.displayName = "SidebarProvider";
