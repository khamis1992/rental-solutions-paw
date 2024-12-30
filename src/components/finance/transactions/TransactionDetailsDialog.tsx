import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Receipt, Calendar, Tag, DollarSign } from "lucide-react";

interface TransactionDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    id: string;
    amount: number;
    description: string;
    transaction_date: string;
    type: 'income' | 'expense';
    category?: {
      name: string;
      type: string;
    };
    receipt_url?: string;
    reference_type?: string;
    reference_id?: string;
    cost_type?: string;
  } | null;
}

export const TransactionDetailsDialog = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsDialogProps) => {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-1">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(transaction.transaction_date), "PPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Badge>
                  </div>
                </div>
                {transaction.category && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{transaction.category.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                {transaction.description || "No description provided"}
              </p>
            </Card>

            {/* Additional Details */}
            {(transaction.cost_type || transaction.reference_type) && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {transaction.cost_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cost Type</p>
                      <p className="font-medium">{transaction.cost_type}</p>
                    </div>
                  )}
                  {transaction.reference_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">Reference Type</p>
                      <p className="font-medium">{transaction.reference_type}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Receipt */}
            {transaction.receipt_url && (
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Receipt</h3>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={transaction.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Receipt
                  </a>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};