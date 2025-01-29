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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { Template } from "@/types/agreement.types";
import { TemplatePreview } from "./TemplatePreview";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate?: Template;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14,
    alignment: 'left'
  });

  const [formData, setFormData] = useState<Partial<Template>>(
    selectedTemplate || {
      name: "",
      description: "",
      content: "",
      language: "english",
      agreement_type: "short_term",
      template_structure: { alignment: 'left' },
      is_active: true,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const templateData = {
        ...formData,
        template_structure: {
          ...formData.template_structure,
          textStyle
        }
      };

      if (selectedTemplate) {
        const { error } = await supabase
          .from("agreement_templates")
          .update(templateData)
          .eq("id", selectedTemplate.id);

        if (error) throw error;
        toast.success("Template updated successfully");
      } else {
        const { error } = await supabase
          .from("agreement_templates")
          .insert([templateData]);

        if (error) throw error;
        toast.success("Template created successfully");
      }

      await queryClient.invalidateQueries({ queryKey: ["agreement-templates"] });
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to save template: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyStyle = (style: keyof TextStyle, value: any) => {
    setTextStyle(prev => ({ ...prev, [style]: value }));
    // Apply style to selected text if any
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (textarea.selectionStart !== textarea.selectionEnd) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = formData.content?.substring(start, end) || '';
      const newContent = 
        (formData.content?.substring(0, start) || '') +
        `<span style="${getStyleString(style, value)}">${selectedText}</span>` +
        (formData.content?.substring(end) || '');
      setFormData({ ...formData, content: newContent });
    }
  };

  const getStyleString = (style: keyof TextStyle, value: any): string => {
    switch (style) {
      case 'bold': return 'font-weight: bold;';
      case 'italic': return 'font-style: italic;';
      case 'underline': return 'text-decoration: underline;';
      case 'fontSize': return `font-size: ${value}px;`;
      case 'alignment': return `text-align: ${value};`;
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <SelectValue placeholder="Select language" />
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

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="content">Template Content</Label>
              <div className="flex gap-2">
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    type="button"
                    variant={textStyle.alignment === 'left' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('alignment', 'left')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textStyle.alignment === 'center' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('alignment', 'center')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textStyle.alignment === 'right' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('alignment', 'right')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textStyle.alignment === 'justify' ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('alignment', 'justify')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignJustify className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    type="button"
                    variant={textStyle.bold ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('bold', !textStyle.bold)}
                    className="w-8 h-8 p-0"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textStyle.italic ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('italic', !textStyle.italic)}
                    className="w-8 h-8 p-0"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={textStyle.underline ? "default" : "ghost"}
                    size="sm"
                    onClick={() => applyStyle('underline', !textStyle.underline)}
                    className="w-8 h-8 p-0"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-1 border rounded-md p-1">
                  <Input
                    type="number"
                    min="8"
                    max="24"
                    value={textStyle.fontSize}
                    onChange={(e) => applyStyle('fontSize', e.target.value)}
                    className="w-16 h-8"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit" : "Preview"}
                </Button>
              </div>
            </div>

            {showPreview ? (
              <TemplatePreview 
                content={formData.content || ""} 
                textStyle={textStyle}
                missingVariables={[]}
              />
            ) : (
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
                className={`min-h-[400px] font-serif text-base leading-relaxed p-6 ${
                  formData.language === 'arabic' ? 'font-arabic text-right' : ''
                }`}
                style={{
                  direction: formData.language === 'arabic' ? 'rtl' : 'ltr',
                  textAlign: textStyle.alignment,
                }}
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Save Template</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};