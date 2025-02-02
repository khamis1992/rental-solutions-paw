import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2 } from "lucide-react";
import type { Agreement } from "@/types/agreement.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DeleteAgreementDialog } from "../DeleteAgreementDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AgreementEditor } from "../print/AgreementEditor";

interface AgreementTableRowProps {
  agreement: Agreement;
  onViewContract: (id: string) => void;
  onPrintContract: (id: string) => void;
  onAgreementClick: (id: string) => void;
  onNameClick: (id: string) => void;
  onDeleted: () => void;
  onDeleteClick: () => void;
}

export const AgreementTableRow = ({
  agreement,
  onAgreementClick,
  onNameClick,
  onDeleted,
  onDeleteClick,
}: AgreementTableRowProps) => {
  const [downloading, setDownloading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateContent, setTemplateContent] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleViewTemplate = async () => {
    try {
      const { data: templateData, error } = await supabase
        .from("agreement_templates")
        .select("content")
        .eq("id", agreement.template_id)
        .single();

      if (error) throw error;

      if (!templateData?.content) {
        toast.error("No template content found");
        return;
      }

      // Replace template variables with actual values
      let content = templateData.content
        .replace(/{{customer\.customer_name}}/g, agreement.customer?.full_name || "")
        .replace(/{{customer\.phone_number}}/g, agreement.customer?.phone_number || "")
        .replace(/{{vehicle\.make}}/g, agreement.vehicle?.make || "")
        .replace(/{{vehicle\.model}}/g, agreement.vehicle?.model || "")
        .replace(/{{vehicle\.year}}/g, agreement.vehicle?.year?.toString() || "")
        .replace(/{{vehicle\.license_plate}}/g, agreement.vehicle?.license_plate || "")
        .replace(/{{agreement\.agreement_number}}/g, agreement.agreement_number || "")
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement.end_date));

      setTemplateContent(content);
      setShowTemplateDialog(true);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast.error("Failed to load template");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const { data: agreement_data, error: agreementError } = await supabase
        .from('leases')
        .select(`
          *,
          agreement_templates!leases_template_id_fkey (
            content,
            language
          ),
          customer:customer_id (
            full_name,
            phone_number,
            email,
            address,
            nationality,
            driver_license
          ),
          vehicle:vehicle_id (
            make,
            model,
            year,
            color,
            license_plate,
            vin
          )
        `)
        .eq('id', agreement.id)
        .maybeSingle();

      if (agreementError) throw agreementError;

      if (!agreement_data?.agreement_templates?.content) {
        toast.error('No template found for this agreement');
        return;
      }

      let templateContent = agreement_data.agreement_templates.content;
      const isRTL = agreement_data.agreement_templates.language === 'arabic';

      // Replace variables
      templateContent = templateContent
        .replace(/{{agreement\.start_date}}/g, formatDateToDisplay(agreement_data.start_date))
        .replace(/{{agreement\.end_date}}/g, formatDateToDisplay(agreement_data.end_date))
        .replace(/{{agreement\.agreement_number}}/g, agreement_data.agreement_number || '')
        .replace(/{{agreement\.rent_amount}}/g, `${agreement_data.rent_amount} QAR`)
        .replace(/{{agreement\.daily_late_fee}}/g, `${agreement_data.daily_late_fee} QAR`)
        .replace(/{{agreement\.agreement_duration}}/g, agreement_data.agreement_duration || '')
        .replace(/{{agreement\.total_amount}}/g, `${agreement_data.total_amount} QAR`)
        .replace(/{{agreement\.down_payment}}/g, agreement_data.down_payment ? `${agreement_data.down_payment} QAR` : '0 QAR')
        .replace(/{{payment\.down_payment}}/g, agreement_data.down_payment ? `${agreement_data.down_payment} QAR` : '0 QAR');

      // Replace customer variables
      if (agreement_data.customer) {
        templateContent = templateContent
          .replace(/{{customer\.name}}/g, agreement_data.customer.full_name || '')
          .replace(/{{customer\.full_name}}/g, agreement_data.customer.full_name || '')
          .replace(/{{customer\.phone_number}}/g, agreement_data.customer.phone_number || '')
          .replace(/{{customer\.email}}/g, agreement_data.customer.email || '')
          .replace(/{{customer\.address}}/g, agreement_data.customer.address || '')
          .replace(/{{customer\.nationality}}/g, agreement_data.customer.nationality || '')
          .replace(/{{customer\.driver_license}}/g, agreement_data.customer.driver_license || '');
      }

      // Replace vehicle variables
      if (agreement_data.vehicle) {
        const vehicleName = `${agreement_data.vehicle.make} ${agreement_data.vehicle.model}`;
        templateContent = templateContent
          .replace(/{{vehicle\.name}}/g, vehicleName)
          .replace(/{{vehicle\.make}}/g, agreement_data.vehicle.make || '')
          .replace(/{{vehicle\.model}}/g, agreement_data.vehicle.model || '')
          .replace(/{{vehicle\.year}}/g, agreement_data.vehicle.year?.toString() || '')
          .replace(/{{vehicle\.color}}/g, agreement_data.vehicle.color || '')
          .replace(/{{vehicle\.license_plate}}/g, agreement_data.vehicle.license_plate || '')
          .replace(/{{vehicle\.vin}}/g, agreement_data.vehicle.vin || '');
      }

      // Create HTML content for PDF with improved print styling
      const htmlContent = `
        <!DOCTYPE html>
        <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isRTL ? 'ar' : 'en'}">
          <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              @page {
                size: A4;
                margin: 25mm;
                marks: crop cross;
                @top-center {
                  content: element(header);
                }
                @bottom-center {
                  content: counter(page);
                }
              }
              
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .page-break {
                  page-break-before: always;
                }
                .no-break {
                  page-break-inside: avoid;
                }
              }
              
              body {
                font-family: ${isRTL ? '"Noto Sans Arabic", Arial' : 'Arial'}, sans-serif;
                direction: ${isRTL ? 'rtl' : 'ltr'};
                text-align: ${isRTL ? 'right' : 'left'};
                line-height: 1.8;
                margin: 0;
                padding: 25mm;
                width: 210mm;
                min-height: 297mm;
                background: white;
                color: #000;
                font-size: 14px;
              }

              .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 2px solid #DAA520;
                margin-bottom: 30px;
              }

              .logo {
                max-width: 300px;
                margin-bottom: 15px;
              }

              .agreement-number {
                font-size: 16px;
                color: #333;
                margin: 15px 0;
                text-align: center;
                font-weight: 500;
              }

              .agreement-title {
                font-size: 24px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
                color: #222;
              }

              h1, h2, h3 {
                margin-top: 1.5em;
                margin-bottom: 0.8em;
                page-break-after: avoid;
                color: #222;
              }

              h1 { font-size: 20px; }
              h2 { font-size: 18px; }
              h3 { font-size: 16px; }

              p {
                margin: 0.8em 0;
                line-height: 1.8;
              }

              table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5em 0;
                page-break-inside: avoid;
              }

              td, th {
                border: 1px solid #000;
                padding: 12px;
                text-align: ${isRTL ? 'right' : 'left'};
              }

              th {
                background-color: #f5f5f5;
                font-weight: bold;
              }

              .footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                text-align: center;
                border-top: 1px solid #DAA520;
                padding: 15px 25mm;
                font-size: 12px;
                background: white;
              }

              .signature-section {
                margin-top: 50px;
                page-break-inside: avoid;
                display: flex;
                justify-content: space-between;
              }

              .signature-box {
                border-top: 1px solid #000;
                width: 200px;
                text-align: center;
                padding-top: 10px;
              }

              .watermark {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 60px;
                color: rgba(218, 165, 32, 0.1);
                z-index: -1;
              }

              .page-number:after {
                content: counter(page);
              }

              ul, ol {
                margin: 1em 0;
                padding-${isRTL ? 'right' : 'left'}: 2em;
              }

              li {
                margin: 0.5em 0;
              }

              .gold-border {
                border-color: #DAA520;
              }
            </style>
          </head>
          <body>
            <div class="watermark">COPY</div>
            <div class="header">
              <img src="/lovable-uploads/0fb89e4f-aba4-4419-8efa-9fc214ac2f83.png" alt="Alaraf Car Rental" class="logo">
              <div class="agreement-number">Agreement #${agreement_data.agreement_number}</div>
              <div class="agreement-title">${isRTL ? 'عقد ايجار مركبة' : 'Vehicle Rental Agreement'}</div>
            </div>
            ${templateContent}
            <div class="footer">
              <div>Alaraf Car Rental | P.O. Box 123, Doha, Qatar | +974 1234 5678 | info@alarafcarrental.com</div>
              <div class="page-number">Page </div>
            </div>
          </body>
        </html>
      `;

      // Convert HTML to PDF using browser's print to PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups and try again.');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      toast.success('Agreement ready for printing');
    } catch (error) {
      console.error('Error preparing agreement for print:', error);
      toast.error('Failed to prepare agreement for printing');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline font-medium"
        >
          {agreement.agreement_number}
        </button>
      </TableCell>
      <TableCell>
        <button
          onClick={() => onNameClick(agreement.id)}
          className="text-primary hover:underline"
        >
          {agreement.vehicle?.license_plate}
        </button>
      </TableCell>
      <TableCell className="font-medium">
        {`${agreement.vehicle?.make} ${agreement.vehicle?.model}`}
      </TableCell>
      <TableCell>
        <span className="font-medium truncate max-w-[200px] block">
          {agreement.customer?.full_name}
        </span>
      </TableCell>
      <TableCell>{formatDateToDisplay(agreement.start_date)}</TableCell>
      <TableCell>{formatDateToDisplay(agreement.end_date)}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={`capitalize ${getStatusColor(agreement.status)}`}
        >
          {agreement.status}
        </Badge>
      </TableCell>
      
      <TableCell className="text-right space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewTemplate}
                className="hover:bg-primary/10"
              >
                <FileText className="h-4 w-4 text-primary hover:text-primary/80" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View Agreement Template</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4 text-red-600 hover:text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Agreement</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DeleteAgreementDialog
          agreementId={agreement.id}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onDeleted={onDeleted}
        />

        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent className="max-w-4xl">
            <AgreementEditor initialContent={templateContent} />
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
};
