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
        alignment: 'right' | 'center' | 'left' | 'justify';
      };
      tables: any[];
    };
  }>({
    name: "",
    description: "",
    content: getDefaultArabicTemplate(),
    language: "arabic",
    agreement_type: "short_term",
    agreement_duration: "12 months",
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

  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        name: selectedTemplate.name,
        description: selectedTemplate.description || "",
        content: selectedTemplate.content || getDefaultArabicTemplate(),
        language: selectedTemplate.language as "english" | "arabic",
        agreement_type: selectedTemplate.agreement_type,
        agreement_duration: selectedTemplate.agreement_duration,
        template_structure: selectedTemplate.template_structure || {
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
    }
  }, [selectedTemplate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting form with data:", formData);

    try {
      const templateData = {
        ...formData,
        is_active: true,
        template_structure: {
          textStyle: formData.template_structure.textStyle,
          tables: formData.template_structure.tables
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
        options: {
          preserveImages: true,
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
        }
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

      // Wrap content in A4 container
      processedHtml = `
        <div class="a4-page">
          ${processedHtml}
        </div>
      `;
      
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
      [{ 'align': ['right', 'center', 'left'] }],
      [{ 'direction': 'rtl' }],
      ['table', 'image'],
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
      <DialogContent className="max-w-4xl h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {selectedTemplate ? "تعديل النموذج" : "إنشاء نموذج جديد"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full pl-4">
          <form onSubmit={handleSubmit} className="space-y-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-right block">اسم النموذج</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agreement_type" className="text-right block">نوع العقد</Label>
                <Select
                  value={formData.agreement_type}
                  onValueChange={(value: "short_term" | "lease_to_own") =>
                    setFormData({ ...formData, agreement_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_term">إيجار قصير المدى</SelectItem>
                    <SelectItem value="lease_to_own">إيجار منتهي بالتمليك</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-right block">الوصف</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">اللغة</Label>
              <Select
                value={formData.language}
                onValueChange={(value: "english" | "arabic") =>
                  setFormData({ ...formData, language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arabic">العربية</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-right block">مدة العقد</Label>
              <Input
                type="text"
                value={formData.agreement_duration}
                onChange={(e) =>
                  setFormData({ ...formData, agreement_duration: e.target.value })
                }
                placeholder="مثال: 12 شهر"
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
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
                    <Upload className="h-4 w-4 ml-2" />
                    استيراد ملف Word
                  </Button>
                </div>
                <Label className="text-right">المحتوى</Label>
              </div>
              <div className="rtl">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                  modules={modules}
                  formats={formats}
                  className="bg-white min-h-[400px]"
                  dir="rtl"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 ml-2" />
                {isSubmitting ? "جاري الحفظ..." : selectedTemplate ? "تحديث النموذج" : "حفظ النموذج"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

function getDefaultArabicTemplate() {
  return `
    <div dir="rtl" class="p-6">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold mb-2">عقد إيجار سيارة</h1>
        <p>رقم العقد: {{agreement.agreement_number}}</p>
        <p>التاريخ: {{agreement.agreement_date}}</p>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">أطراف العقد</h2>
        <div class="mb-4">
          <h3 class="font-bold">الطرف الأول (المؤجر):</h3>
          <p>شركة تأجير السيارات</p>
          <p>السجل التجاري:</p>
          <p>العنوان:</p>
        </div>
        <div>
          <h3 class="font-bold">الطرف الثاني (المستأجر):</h3>
          <p>الاسم: {{customer.customer_name}}</p>
          <p>رقم الهوية: {{customer.customer_nationality}}</p>
          <p>رقم الجوال: {{customer.customer_phone}}</p>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">تفاصيل السيارة</h2>
        <table class="w-full border-collapse border">
          <tr>
            <th class="border p-2">الماركة</th>
            <td class="border p-2">{{vehicle.vehicle_make}}</td>
            <th class="border p-2">الموديل</th>
            <td class="border p-2">{{vehicle.vehicle_model}}</td>
          </tr>
          <tr>
            <th class="border p-2">سنة الصنع</th>
            <td class="border p-2">{{vehicle.vehicle_year}}</td>
            <th class="border p-2">رقم اللوحة</th>
            <td class="border p-2">{{vehicle.vehicle_license_plate}}</td>
          </tr>
        </table>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">الشروط المالية</h2>
        <ul class="list-disc mr-6">
          <li>قيمة الإيجار: {{payment.rent_amount}} ريال قطري</li>
          <li>الدفعة المقدمة: {{payment.down_payment}} ريال قطري</li>
          <li>مدة العقد: {{agreement.agreement_duration}}</li>
          <li>غرامة التأخير اليومية: {{terms.daily_late_fee}} ريال قطري</li>
        </ul>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold mb-4">الشروط والأحكام العامة</h2>
        <ol class="list-decimal mr-6">
          <li>يلتزم المستأجر بدفع قيمة الإيجار في موعدها المحدد.</li>
          <li>يلتزم المستأجر بالمحافظة على السيارة وصيانتها.</li>
          <li>يمنع منعاً باتاً استخدام السيارة في أغراض غير قانونية.</li>
          <li>في حالة التأخير عن سداد الإيجار تطبق غرامة تأخير يومية.</li>
        </ol>
      </div>

      <div class="mt-12">
        <h2 class="text-xl font-bold mb-6">التوقيعات</h2>
        <div class="flex justify-between">
          <div class="text-center">
            <p class="font-bold mb-8">الطرف الأول (المؤجر)</p>
            <div class="border-t border-black pt-2">التوقيع</div>
          </div>
          <div class="text-center">
            <p class="font-bold mb-8">الطرف الثاني (المستأجر)</p>
            <div class="border-t border-black pt-2">التوقيع</div>
          </div>
        </div>
      </div>
    </div>
  `;
}
