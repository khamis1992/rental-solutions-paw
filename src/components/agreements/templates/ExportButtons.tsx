import { Button } from "@/components/ui/button";
import { Download, FileText, Printer } from "lucide-react";
import { handlePrint, exportToPDF, exportToWord } from "./utils/documentUtils";
import { toast } from "sonner";

interface ExportButtonsProps {
  content: string;
  filename: string;
}

export const ExportButtons = ({ content, filename }: ExportButtonsProps) => {
  const handleExportPDF = async () => {
    try {
      await exportToPDF(content, `${filename}.pdf`);
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF");
    }
  };

  const handleExportWord = () => {
    try {
      exportToWord(content, filename);
      toast.success("Word document exported successfully");
    } catch (error) {
      toast.error("Failed to export Word document");
    }
  };

  return (
    <div className="flex gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePrint(content)}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Export PDF
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportWord}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Export Word
      </Button>
    </div>
  );
};