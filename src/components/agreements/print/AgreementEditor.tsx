import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Printer, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <html>
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
            }
            .content {
              max-width: 210mm;
              margin: 0 auto;
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

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 mb-4">
        <Button
          variant={isPreviewMode ? "outline" : "default"}
          onClick={() => setIsPreviewMode(!isPreviewMode)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {isPreviewMode ? "Edit" : "Preview"}
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {isPreviewMode ? (
        <Card className="p-6">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </Card>
      ) : (
        <Card className={cn("p-0 overflow-hidden", "min-h-[500px]")}>
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            className="h-[450px]"
          />
        </Card>
      )}
    </div>
  );
};