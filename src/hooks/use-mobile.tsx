'use client';

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with null to indicate loading state
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Function to check if window width is mobile
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
      }
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Return false as default if isMobile is null (during SSR or initial load)
  return isMobile ?? false;
}