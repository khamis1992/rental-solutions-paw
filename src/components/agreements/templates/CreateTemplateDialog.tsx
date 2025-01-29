import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Template, TextStyle, Table } from "@/types/agreement.types";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Table as TableIcon,
  Save
} from "lucide-react";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate?: Template | null;
}

type DocumentLanguage = "english" | "spanish" | "french" | "arabic";

interface TemplateFormData {
  name: string;
  description: string;
  content: string;
  language: DocumentLanguage;
  agreement_type: string;
  textStyle?: TextStyle;
  tables?: Table[];
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: selectedTemplate?.name || "",
    description: selectedTemplate?.description || "",
    content: selectedTemplate?.content || "",
    language: selectedTemplate?.language || "english",
    agreement_type: selectedTemplate?.agreement_type || "",
    textStyle: {
      bold: false,
      italic: false,
      underline: false,
      fontSize: 14,
      alignment: 'left'
    },
    tables: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("legal_document_templates")
        .insert(formData);

      if (error) throw error;

      toast.success("Template created successfully");
      queryClient.invalidateQueries({ queryKey: ["legal-templates"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to create template: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextStyle = (type: keyof TextStyle | "align", value?: string) => {
    setFormData(prev => ({
      ...prev,
      textStyle: {
        ...prev.textStyle!,
        [type]: type === "align" ? value : !prev.textStyle![type as keyof TextStyle],
      }
    }));
  };

  const handleInsertTable = () => {
    const newTable: Table = {
      rows: [
        {
          cells: [
            { content: "Header 1", style: { ...formData.textStyle } },
            { content: "Header 2", style: { ...formData.textStyle } }
          ]
        },
        {
          cells: [
            { content: "Cell 1", style: { ...formData.textStyle } },
            { content: "Cell 2", style: { ...formData.textStyle } }
          ]
        }
      ],
      style: {
        width: "100%",
        borderCollapse: "collapse",
        borderSpacing: "0"
      }
    };

    setFormData(prev => ({
      ...prev,
      tables: [...(prev.tables || []), newTable],
      content: prev.content + "\n\n[TABLE]\n\n"
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full pr-4">
          <div className="space-y-6 pb-6">
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
                <Label htmlFor="agreement_type">Agreement Type</Label>
                <Select
                  value={formData.agreement_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, agreement_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">Short Term</SelectItem>
                    <SelectItem value="lease_to_own">Lease to Own</SelectItem>
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

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value: DocumentLanguage) =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <Label>Content</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("align", "left")}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("align", "center")}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("align", "right")}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("align", "justify")}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("bold")}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("italic")}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("underline")}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleInsertTable}
                  >
                    <TableIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="min-h-[400px] font-mono"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};