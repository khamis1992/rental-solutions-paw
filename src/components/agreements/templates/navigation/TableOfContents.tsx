import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  sections: Array<{ id: string; title: string; level: number }>;
  onSectionClick: (id: string) => void;
  activeSection?: string;
}

export const TableOfContents = ({ sections, onSectionClick, activeSection }: TableOfContentsProps) => {
  return (
    <nav className="w-64 p-4 border rounded-lg bg-background">
      <h3 className="font-semibold mb-4">Table of Contents</h3>
      <div className="space-y-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={cn(
              "w-full text-left px-2 py-1 rounded-md text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              activeSection === section.id && "bg-accent text-accent-foreground",
              section.level === 1 ? "font-medium" : "pl-4 text-muted-foreground"
            )}
          >
            {section.title}
          </button>
        ))}
      </div>
    </nav>
  );
};