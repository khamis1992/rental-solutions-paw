import { useState } from "react";
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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    language: "english",
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

  const handleVariableSelect = (variable: string) => {
    const textArea = document.getElementById("content") as HTMLTextAreaElement;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const text = textArea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);

    setFormData({
      ...formData,
      content: before + variable + after,
    });

    // Reset cursor position after React updates the textarea
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(
        start + variable.length,
        start + variable.length
      );
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
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
                    onValueChange={(value) =>
                      setFormData({ ...formData, language: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
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

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
                <TabsList>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="variables">Variables</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="h-[400px] mt-2">
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="h-full"
                    placeholder="Enter your template content here. Use {{variable.name}} syntax for dynamic values."
                  />
                </TabsContent>

                <TabsContent value="preview" className="h-[400px] mt-2">
                  <TemplatePreview 
                    content={formData.content}
                    missingVariables={[]} // TODO: Implement validation
                  />
                </TabsContent>

                <TabsContent value="variables" className="h-[400px] mt-2">
                  <VariableSuggestions onVariableSelect={handleVariableSelect} />
                </TabsContent>
              </Tabs>
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