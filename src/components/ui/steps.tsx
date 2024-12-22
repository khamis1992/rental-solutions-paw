import { Check } from "lucide-react";

interface StepsProps {
  items: string[];
}

export function Steps({ items }: StepsProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-background">
            <span className="text-sm font-medium">{index + 1}</span>
          </div>
          <div className="flex items-center">
            <p className="text-sm">{item}</p>
          </div>
        </div>
      ))}
    </div>
  );
}