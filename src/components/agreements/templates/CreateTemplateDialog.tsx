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

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    content: string;
    language: "english" | "arabic";
    agreement_type: "short_term" | "lease_to_own";
    textStyle: TextStyle;
    tables: Table[];
  }>({
    name: selectedTemplate?.name || "",
    description: selectedTemplate?.description || "",
    content: selectedTemplate?.content || "",
    language: selectedTemplate?.language as "english" | "arabic" || "english",
    agreement_type: selectedTemplate?.agreement_type || "short_term",
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
      const templateData = {
        ...formData,
        template_structure: {
          textStyle: formData.textStyle,
          tables: formData.tables
        }
      };

      const { error } = await supabase
        .from("legal_document_templates")
        .insert(templateData);

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

  const handleTextStyle = (type: keyof TextStyle | "alignment", value?: string) => {
    setFormData(prev => ({
      ...prev,
      textStyle: {
        ...prev.textStyle,
        [type]: type === "alignment" ? value : !prev.textStyle[type as keyof TextStyle],
      }
    }));

    // Apply style to selected text
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = formData.content.substring(start, end);
      
      if (selectedText) {
        const prefix = formData.content.substring(0, start);
        const suffix = formData.content.substring(end);
        let styledText = selectedText;

        if (type === "alignment") {
          styledText = `<div style="text-align: ${value};">${selectedText}</div>`;
        } else {
          const style = type.toLowerCase();
          styledText = `<span style="${style}: ${type === 'bold' ? 'bold' : type === 'italic' ? 'italic' : 'underline'};">${selectedText}</span>`;
        }

        setFormData(prev => ({
          ...prev,
          content: prefix + styledText + suffix
        }));
      }
    }
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

    const tableHtml = `
<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <th style="border: 1px solid #ddd; padding: 8px;">Header 1</th>
    <th style="border: 1px solid #ddd; padding: 8px;">Header 2</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
  </tr>
</table>
`;

    setFormData(prev => ({
      ...prev,
      tables: [...prev.tables, newTable],
      content: prev.content + tableHtml
    }));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    
    // Insert the text at the cursor position
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = formData.content;
    
    setFormData(prev => ({
      ...prev,
      content: currentContent.substring(0, start) + text + currentContent.substring(end)
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
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
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
                  onValueChange={(value: "short_term" | "lease_to_own") =>
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
                onValueChange={(value: "english" | "arabic") =>
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
                    onClick={() => handleTextStyle("alignment", "left")}
                    className={formData.textStyle.alignment === 'left' ? 'bg-secondary' : ''}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("alignment", "center")}
                    className={formData.textStyle.alignment === 'center' ? 'bg-secondary' : ''}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("alignment", "right")}
                    className={formData.textStyle.alignment === 'right' ? 'bg-secondary' : ''}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("alignment", "justify")}
                    className={formData.textStyle.alignment === 'justify' ? 'bg-secondary' : ''}
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("bold")}
                    className={formData.textStyle.bold ? 'bg-secondary' : ''}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("italic")}
                    className={formData.textStyle.italic ? 'bg-secondary' : ''}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTextStyle("underline")}
                    className={formData.textStyle.underline ? 'bg-secondary' : ''}
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
                onPaste={handlePaste}
                className="min-h-[400px] font-mono"
                dir={formData.language === "arabic" ? "rtl" : "ltr"}
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
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};