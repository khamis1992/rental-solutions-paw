import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplatePreview } from "./TemplatePreview";
import { VariableSuggestions } from "./VariableSuggestions";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    language: "english" as "english" | "spanish" | "french" | "arabic",
    template_structure: {},
    template_sections: [],
    variable_mappings: {
      agreement: {},
      vehicle: {},
      customer: {},
      terms: {},
      payment: {},
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("legal_document_templates")
        .insert({
          ...formData,
          template_structure: JSON.stringify(formData.template_structure),
          variable_mappings: JSON.stringify(formData.variable_mappings),
        });

      if (error) throw error;

      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-templates"] });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating template:", error);
      toast.error("Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVariableSelect = useCallback((variable: string) => {
    if (!textAreaRef.current || cursorPosition === null) return;

    const start = cursorPosition;
    const text = textAreaRef.current.value;
    const before = text.substring(0, start);
    const after = text.substring(start);

    const newContent = before + variable + after;
    setFormData(prev => ({
      ...prev,
      content: newContent
    }));

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPosition = start + variable.length;
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  }, [cursorPosition]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }));
    setCursorPosition(e.target.selectionStart);
  };

  const handleTextAreaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  const handleTextAreaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Agreement Template</DialogTitle>
          <DialogDescription>
            Create a new template for lease agreements with dynamic variables
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value: "english" | "spanish" | "french" | "arabic") =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <ScrollArea className="w-full" orientation="horizontal">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-w-[800px]">
                  <TabsList>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="variables">Variables</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="h-[400px] mt-2 relative">
                    <Textarea
                      ref={textAreaRef}
                      id="content"
                      value={formData.content}
                      onChange={handleTextAreaChange}
                      onClick={handleTextAreaClick}
                      onKeyUp={handleTextAreaKeyUp}
                      className="h-full"
                      placeholder="Enter your template content here. Use {{variable.name}} syntax for dynamic values."
                    />
                    {activeTab === "edit" && (
                      <div className="absolute right-0 top-0 w-64 bg-background border rounded-md shadow-lg">
                        <VariableSuggestions 
                          onVariableSelect={handleVariableSelect}
                          currentContent={formData.content}
                          cursorPosition={cursorPosition}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="preview" className="h-[400px] mt-2">
                    <TemplatePreview 
                      content={formData.content}
                      missingVariables={[]}
                    />
                  </TabsContent>

                  <TabsContent value="variables" className="h-[400px] mt-2">
                    <VariableSuggestions onVariableSelect={handleVariableSelect} />
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};