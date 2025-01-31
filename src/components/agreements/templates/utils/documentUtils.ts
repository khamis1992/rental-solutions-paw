import { Template } from "@/types/agreement.types";
import { injectPrintStyles } from "@/lib/printStyles";

export const handlePrint = (content: string) => {
  // Inject print styles
  injectPrintStyles();
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Failed to open print window');
    return;
  }

  // Add content and necessary styles
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Agreement</title>
        <style>
          @media print {
            body {
              padding: 20mm;
              direction: inherit;
            }
            .template-variable {
              color: inherit;
              background: none;
              border: none;
            }
            .agreement-table {
              width: 100%;
              border-collapse: collapse;
              page-break-inside: auto;
            }
            .agreement-table td,
            .agreement-table th {
              border: 1px solid #000;
              padding: 8px;
              text-align: inherit;
            }
            [dir="rtl"] {
              text-align: right;
              direction: rtl;
            }
          }
        </style>
      </head>
      <body class="print-content">
        ${content}
      </body>
    </html>
  `);

  // Trigger print
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

export const exportToPDF = async (content: string, filename: string) => {
  try {
    const response = await fetch('/api/export-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, filename }),
    });

    if (!response.ok) throw new Error('Failed to generate PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

export const exportToWord = (content: string, filename: string) => {
  // Convert HTML to Word-compatible format
  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <style>
        table { border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 8px; }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;

  const blob = new Blob([wordContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};