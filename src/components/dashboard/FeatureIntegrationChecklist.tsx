import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

interface ChecklistItem {
  id: string;
  title: string;
  items: {
    id: string;
    text: string;
    checked: boolean;
  }[];
}

export const FeatureIntegrationChecklist = () => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: "architecture",
      title: "System Architecture Review",
      items: [
        { id: "compatibility", text: "Compatibility with existing modules", checked: false },
        { id: "database", text: "Database schema changes or new tables", checked: false },
        { id: "dependencies", text: "System dependencies verification", checked: false },
      ],
    },
    {
      id: "api",
      title: "API Design and Endpoints",
      items: [
        { id: "integration", text: "REST or GraphQL integration for the feature", checked: false },
        { id: "auth", text: "Authentication and authorization handling", checked: false },
        { id: "documentation", text: "API documentation and examples", checked: false },
      ],
    },
    {
      id: "ui",
      title: "UI/UX Integration",
      items: [
        { id: "design", text: "Consistency with current design systems", checked: false },
        { id: "responsive", text: "Responsiveness and accessibility standards", checked: false },
        { id: "testing", text: "Cross-browser and device testing", checked: false },
      ],
    },
  ]);

  const toggleCheckbox = (sectionId: string, itemId: string) => {
    setChecklist(prev =>
      prev.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map(item =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        return section;
      })
    );
  };

  const getProgress = () => {
    const totalItems = checklist.reduce((acc, section) => acc + section.items.length, 0);
    const checkedItems = checklist.reduce(
      (acc, section) => acc + section.items.filter(item => item.checked).length,
      0
    );
    return Math.round((checkedItems / totalItems) * 100);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Feature Integration Checklist</h2>
          <span className="text-sm text-muted-foreground">
            Progress: {getProgress()}%
          </span>
        </div>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {checklist.map(section => (
              <div key={section.id} className="space-y-4">
                <h3 className="text-lg font-medium">{section.title}</h3>
                <div className="space-y-3">
                  {section.items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${section.id}-${item.id}`}
                        checked={item.checked}
                        onCheckedChange={() => toggleCheckbox(section.id, item.id)}
                      />
                      <Label
                        htmlFor={`${section.id}-${item.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {item.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};