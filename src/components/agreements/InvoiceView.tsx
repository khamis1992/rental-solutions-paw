import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InvoiceData } from "./utils/invoiceUtils";

interface InvoiceViewProps {
  data: InvoiceData;
  onPrint?: () => void;
}

export const InvoiceView = ({ data, onPrint }: InvoiceViewProps) => {
  const { data: settings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    }
    window.print();
  };

  // Calculate total paid amount, balance and late fines
  const totalPaidAmount = data.payments?.reduce((sum, payment) => sum + payment.amount_paid, 0) || 0;
  const totalBalance = data.payments?.reduce((sum, payment) => sum + payment.balance, 0) || 0;
  const totalLateFines = data.payments?.reduce((sum, payment) => sum + (payment.late_fine_amount || 0), 0) || 0;

  return (
    <ScrollArea className="h-[calc(100vh-200px)] w-full">
      <Card className="p-8 max-w-4xl mx-auto bg-white shadow-lg print:shadow-none print:p-4 print:max-w-none">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              {settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  className="h-16 object-contain print:h-12"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">Invoice</h1>
                <p className="text-gray-600 mt-1">#{data.invoiceNumber}</p>
              </div>
              {settings?.company_name && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium">{settings.company_name}</p>
                  <p>{settings.address}</p>
                  <p>{settings.phone}</p>
                  <p>{settings.business_email}</p>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint} 
              className="print:hidden hover:bg-gray-100"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-200 py-8">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Bill To:</h3>
              <div className="space-y-1 text-gray-600">
                <p className="font-medium text-gray-800">{data.customerName}</p>
                <p className="whitespace-pre-line">{data.customerAddress}</p>
              </div>
            </div>
            <div className="text-right space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Date: </span>
                <span className="text-gray-600">{data.startDate}</span>
              </div>
              {data.dueDate && (
                <div>
                  <span className="font-semibold text-gray-700">Due Date: </span>
                  <span className="text-gray-600">{data.dueDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Vehicle Details:</h3>
            <p className="text-gray-600">{data.vehicleDetails}</p>
            <p className="text-gray-600">
              {data.agreementType}: {data.startDate} - {data.endDate}
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                  <th className="text-right py-3 px-4 text-gray-700 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-3 px-4 text-gray-600">{item.description}</td>
                    <td className="text-right py-3 px-4 text-gray-800 font-medium">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {/* Payment History Section with Late Fines */}
        {data.payments && data.payments.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Payment History</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">Description</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Amount</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Late Fine</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-semibold">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {data.payments.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-b-0">
                      <td className="py-3 px-4 text-gray-600">
                        {payment.payment_date 
                          ? format(new Date(payment.payment_date), 'dd/MM/yyyy')
                          : format(new Date(payment.created_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{payment.description || '-'}</td>
                      <td className="text-right py-3 px-4 text-gray-800 font-medium">
                        {formatCurrency(payment.amount_paid)}
                      </td>
                      <td className="text-right py-3 px-4 text-red-600 font-medium">
                        {payment.late_fine_amount ? formatCurrency(payment.late_fine_amount) : '-'}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-600 capitalize">
                        {payment.payment_method?.toLowerCase().replace('_', ' ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Section with Late Fines */}
        <div className="border-t pt-6 mt-8">
          <div className="flex flex-col items-end space-y-3">
            <div className="flex justify-between w-64 text-gray-600">
              <span>Balance:</span>
              <span className="font-medium text-red-600">
                {formatCurrency(-Math.abs(totalBalance))}
              </span>
            </div>
            <div className="flex justify-between w-64 text-gray-600">
              <span>Amount Paid:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(totalPaidAmount)}
              </span>
            </div>
            {totalLateFines > 0 && (
              <div className="flex justify-between w-64 text-gray-600">
                <span>Late Fines:</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(totalLateFines)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-64 bg-gray-50 p-4 rounded-lg mt-2">
              <span className="font-semibold text-gray-700">Total Due:</span>
              <span className="font-bold text-xl text-gray-900">
                {formatCurrency(Math.max(0, totalBalance + totalLateFines))}
              </span>
            </div>
          </div>
        </div>

          <div className="text-center text-sm text-gray-500 pt-8 border-t">
            <p>Thank you for your business!</p>
            {settings?.company_name && (
              <p className="mt-1">{settings.company_name}</p>
            )}
          </div>
      </Card>
    </ScrollArea>
  );
};
