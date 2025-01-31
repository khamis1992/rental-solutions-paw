import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MiniMapProps {
  contentRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const MiniMap = ({ contentRef, className }: MiniMapProps) => {
  const miniMapRef = useRef<HTMLDivElement>(null);
  const viewportIndicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    const miniMap = miniMapRef.current;
    const viewport = viewportIndicatorRef.current;

    if (!content || !miniMap || !viewport) return;

    const updateViewportIndicator = () => {
      const contentRect = content.getBoundingClientRect();
      const scrollPercentage = content.scrollTop / (content.scrollHeight - contentRect.height);
      const viewportHeight = (contentRect.height / content.scrollHeight) * miniMap.clientHeight;
      const viewportTop = scrollPercentage * (miniMap.clientHeight - viewportHeight);

      viewport.style.height = `${viewportHeight}px`;
      viewport.style.transform = `translateY(${viewportTop}px)`;
    };

    content.addEventListener("scroll", updateViewportIndicator);
    window.addEventListener("resize", updateViewportIndicator);
    updateViewportIndicator();

    return () => {
      content.removeEventListener("scroll", updateViewportIndicator);
      window.removeEventListener("resize", updateViewportIndicator);
    };
  }, [contentRef]);

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const content = contentRef.current;
    const miniMap = miniMapRef.current;
    if (!content || !miniMap) return;

    const clickPosition = (e.clientY - miniMap.getBoundingClientRect().top) / miniMap.clientHeight;
    const scrollTarget = clickPosition * content.scrollHeight;
    content.scrollTo({ top: scrollTarget, behavior: "smooth" });
  };

  return (
    <div
      ref={miniMapRef}
      className={cn(
        "w-24 h-full bg-background border rounded-md relative cursor-pointer",
        className
      )}
      onClick={handleMiniMapClick}
    >
      <div
        ref={viewportIndicatorRef}
        className="absolute left-0 right-0 bg-accent/50 rounded-sm transition-transform"
      />
    </div>
  );
};