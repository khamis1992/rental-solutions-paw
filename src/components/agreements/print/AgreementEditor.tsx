import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Eye, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AgreementEditorProps {
  initialContent: string;
}

export const AgreementEditor = ({ initialContent }: AgreementEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: ["right", "center", "left", "justify"] }],
      [{ direction: "rtl" }],
      ["clean"],
      [{ size: ["small", false, "large", "huge"] }],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "align",
    "direction",
    "size",
  ];

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>Print Agreement</title>
          <style>
            @page {
              size: A4;
              margin: 2cm;
            }
            @font-face {
              font-family: 'Noto Sans Arabic';
              src: url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;700&display=swap');
            }
            body {
              font-family: 'Noto Sans Arabic', sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              direction: rtl;
              text-align: right;
            }
            .content {
              max-width: 210mm;
              margin: 0 auto;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 1em 0;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: right;
            }
            @media print {
              .content {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            ${content}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleSave = () => {
    // Remove extra spaces while preserving HTML formatting
    const cleanContent = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/>\s+</g, '><')  // Remove spaces between HTML tags
      .trim();
    
    setContent(cleanContent);
    toast.success("تم حفظ المستند وإزالة المسافات الزائدة");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={isPreviewMode ? "outline" : "default"}
          onClick={() => setIsPreviewMode(!isPreviewMode)}
        >
          <Eye className="h-4 w-4 ml-2" />
          {isPreviewMode ? "تحرير" : "معاينة"}
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 ml-2" />
          حفظ
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 ml-2" />
          طباعة
        </Button>
      </div>

      {isPreviewMode ? (
        <Card className="p-6">
          <div
            className="prose max-w-none text-right"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>
      ) : (
        <Card className={cn("p-0 overflow-hidden", "min-h-[500px]")}>
          <div className="rtl-editor">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="h-[450px]"
            />
          </div>
        </Card>
      )}
    </div>
  );
};