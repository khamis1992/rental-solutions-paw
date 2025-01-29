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
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { toast } from "sonner";
import { Template } from "@/types/agreement.types";

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate?: Template;
}

export const CreateTemplateDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
}: CreateTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>(
    selectedTemplate?.template_structure?.alignment || 'left'
  );
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
          alignment: textAlignment
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
          .insert({
            ...templateData,
            agreement_duration: "12 months", // Default duration
          });

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
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Template Content</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={textAlignment === 'left' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTextAlignment('left')}
                  className="w-9 h-9 p-0"
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={textAlignment === 'center' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTextAlignment('center')}
                  className="w-9 h-9 p-0"
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={textAlignment === 'right' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTextAlignment('right')}
                  className="w-9 h-9 p-0"
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                textAlign: textAlignment,
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : selectedTemplate ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};