import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AgreementEditorProps {
  initialContent: string;
  onSave?: () => void;
}

export const AgreementEditor = ({ initialContent, onSave }: AgreementEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [showPreview, setShowPreview] = useState(false);

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
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>Print Agreement</title>
            <style>
              @page {
                size: A4;
                margin: 2cm;
              }
              body {
                font-family: Arial, sans-serif;
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
                direction: rtl;
                text-align: right;
              }
              th, td {
                text-align: right;
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
      if (onSave) {
        onSave();
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-end space-x-2 mb-4">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          formats={formats}
          className="bg-white min-h-[500px]"
          dir="rtl"
        />
      </Card>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div 
            className="prose max-w-none dark:prose-invert"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};