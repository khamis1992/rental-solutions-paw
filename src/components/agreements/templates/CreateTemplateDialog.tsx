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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mammoth from 'mammoth';
import { Save, Upload } from "lucide-react";
import { Template } from "@/types/agreement.types";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    content: string;
    language: "english" | "arabic";
    agreement_type: "short_term" | "lease_to_own";
    agreement_duration: string;
    template_structure: {
      textStyle: {
        bold: boolean;
        italic: boolean;
        underline: boolean;
        fontSize: number;
        alignment: 'right';
      };
      tables: any[];
    };
  }>({
    name: selectedTemplate?.name || "",
    description: selectedTemplate?.description || "",
    content: selectedTemplate?.content || "",
    language: "arabic",
    agreement_type: selectedTemplate?.agreement_type || "short_term",
    agreement_duration: selectedTemplate?.agreement_duration || "12 months",
    template_structure: {
      textStyle: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 14,
        alignment: 'right'
      },
      tables: []
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("agreement_templates")
        .insert({
          ...formData,
          is_active: true,
          template_structure: JSON.stringify(formData.template_structure)
        });

      if (error) throw error;

      toast.success("Template created successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to create template: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      toast.error("Please upload a .docx file");
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ 
        arrayBuffer,
        transformDocument: (element) => {
          // Force RTL for all paragraphs and tables
          if (element.type === 'paragraph' || element.type === 'table') {
            element.alignment = 'right';
            element.attributes = { ...element.attributes, dir: 'rtl' };
          }
          return element;
        },
        options: {
          preserveStyles: true,
          styleMap: [
            "p[style-name='Normal'] => p.rtl-paragraph",
            "table => table.rtl-table",
            "tr => tr.rtl-row",
            "td => td.rtl-cell"
          ]
        }
      });
      
      let processedHtml = result.value;
      
      // Add RTL wrapper and enhance table styling
      processedHtml = `<div class="rtl-content" dir="rtl" style="text-align: right;">${processedHtml}</div>`;
      
      // Enhance table styling
      processedHtml = processedHtml
        .replace(/<table/g, '<table class="rtl-table" style="width: 100%; direction: rtl;"')
        .replace(/<td/g, '<td style="text-align: right; padding: 0.75rem;"');

      // Style template variables
      processedHtml = processedHtml
        .replace(/{{/g, '<span class="template-variable">{{')
        .replace(/}}/g, '}}</span>');
      
      setFormData(prev => ({
        ...prev,
        content: processedHtml,
        language: 'arabic'
      }));

      toast.success("Document imported successfully");
    } catch (error) {
      console.error('Error converting document:', error);
      toast.error("Failed to import document");
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': ['right', 'center', 'justify'] }],
      ['table'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align',
    'table'
  ];

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
              <Label>Agreement Duration</Label>
              <Input
                type="text"
                value={formData.agreement_duration}
                onChange={(e) =>
                  setFormData({ ...formData, agreement_duration: e.target.value })
                }
                placeholder="e.g., 12 months"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Content</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="docx-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('docx-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Word Document
                  </Button>
                </div>
              </div>
              <div className="rtl-editor-container" style={{ direction: 'rtl' }}>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  modules={modules}
                  formats={formats}
                  className="bg-white min-h-[400px]"
                />
              </div>
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