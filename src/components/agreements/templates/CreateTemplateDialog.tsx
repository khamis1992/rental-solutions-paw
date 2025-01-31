import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mammoth from 'mammoth';
import { Save, Upload } from "lucide-react";
import { Template } from "@/types/agreement.types";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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
        alignment: 'left' | 'center' | 'right' | 'justify';
      };
      tables: any[];
    };
  }>({
    name: "",
    description: "",
    content: "",
    language: "english",
    agreement_type: "short_term",
    agreement_duration: "12 months",
    template_structure: {
      textStyle: {
        bold: false,
        italic: false,
        underline: false,
        fontSize: 14,
        alignment: 'left'
      },
      tables: []
    }
  });

  useEffect(() => {
    if (selectedTemplate) {
      console.log("Setting form data from selected template:", selectedTemplate);
      setFormData({
        name: selectedTemplate.name || "",
        description: selectedTemplate.description || "",
        content: selectedTemplate.content || "",
        language: selectedTemplate.language as "english" | "arabic" || "english",
        agreement_type: selectedTemplate.agreement_type || "short_term",
        agreement_duration: selectedTemplate.agreement_duration || "12 months",
        template_structure: selectedTemplate.template_structure || {
          textStyle: {
            bold: false,
            italic: false,
            underline: false,
            fontSize: 14,
            alignment: 'left'
          },
          tables: []
        }
      });
    }
  }, [selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting form with data:", formData);

    try {
      const templateData = {
        name: formData.name,
        description: formData.description,
        content: formData.content,
        language: formData.language,
        agreement_type: formData.agreement_type,
        agreement_duration: formData.agreement_duration,
        template_structure: formData.template_structure,
        is_active: true,
        variable_mappings: {
          "terms": {
            "end_date": "leases.end_date",
            "start_date": "leases.start_date",
            "final_price": "leases.total_amount",
            "rent_amount": "leases.rent_amount",
            "daily_late_fee": "leases.daily_late_fee",
            "agreement_duration": "leases.agreement_duration"
          },
          "payment": {
            "down_payment": "leases.down_payment",
            "monthly_payment": "leases.monthly_payment",
            "payment_due_day": "leases.rent_due_day"
          },
          "vehicle": {
            "vehicle_vin": "vehicles.vin",
            "vehicle_make": "vehicles.make",
            "vehicle_year": "vehicles.year",
            "vehicle_color": "vehicles.color",
            "vehicle_model": "vehicles.model",
            "vehicle_license_plate": "vehicles.license_plate"
          },
          "customer": {
            "customer_name": "profiles.full_name",
            "customer_email": "profiles.email",
            "customer_phone": "profiles.phone_number",
            "customer_address": "profiles.address",
            "customer_nationality": "profiles.nationality"
          },
          "agreement": {
            "agreement_date": "leases.created_at",
            "agreement_type": "leases.agreement_type",
            "agreement_number": "leases.agreement_number"
          }
        }
      };

      let error;

      if (selectedTemplate) {
        console.log("Updating template with ID:", selectedTemplate.id);
        const { error: updateError } = await supabase
          .from("agreement_templates")
          .update(templateData)
          .eq('id', selectedTemplate.id);
        error = updateError;
      } else {
        console.log("Creating new template");
        const { error: insertError } = await supabase
          .from("agreement_templates")
          .insert(templateData);
        error = insertError;
      }

      if (error) {
        console.error("Error saving template:", error);
        throw error;
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ["agreement-templates"] });
      
      toast.success(selectedTemplate ? "Template updated successfully" : "Template created successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template: " + error.message);
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
        preserveStyles: true,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "b => strong",
          "i => em",
          "u => u",
          "strike => s",
          "p[dir='rtl'] => p.rtl:fresh",
          "table => table.agreement-table:fresh",
          "tr => tr:fresh",
          "td => td:fresh",
          "p[style-name='RTL'] => p.rtl:fresh",
          "r[style-name='RTL'] => span.rtl:fresh"
        ]
      });
      
      let processedHtml = result.value;

      // Add RTL class and dir attribute to paragraphs containing Arabic text
      processedHtml = processedHtml.replace(
        /(<(?:p|div|span)(?:[^>]*)>)((?:[^<]*[\u0600-\u06FF][^<]*))<\/(?:p|div|span)>/g,
        (_, openTag, content) => {
          const hasClass = openTag.includes('class="');
          const newOpenTag = hasClass ? 
            openTag.replace('class="', 'class="rtl ') :
            openTag.replace('>', ' class="rtl" dir="rtl">');
          return `${newOpenTag}${content}</p>`;
        }
      );

      // Style template variables
      processedHtml = processedHtml
        .replace(/{{/g, '<span class="template-variable">{{')
        .replace(/}}/g, '}}</span>');

      // Enhance table styling
      processedHtml = processedHtml
        .replace(/<table/g, '<table class="agreement-table" style="width: 100%; direction: inherit;"')
        .replace(/<td/g, '<td style="text-align: inherit; padding: 0.75rem;"');
      
      setFormData(prev => ({
        ...prev,
        content: processedHtml
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
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['table'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'align', 'direction',
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
              <div 
                className={formData.language === "arabic" ? "rtl" : "ltr"}
                dir={formData.language === "arabic" ? "rtl" : "ltr"}
              >
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
                {isSubmitting ? "Saving..." : selectedTemplate ? "Update Template" : "Save Template"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};