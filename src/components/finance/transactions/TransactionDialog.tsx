import { TransactionType } from "../types/transaction.types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const TransactionDialog = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    // Handle the submission of the transaction data
    try {
      const { error } = await supabase
        .from('accounting_transactions')
        .insert({
          agreement_number: data.agreement_number,
          amount: Number(data.amount),
          category_id: data.category_id,
          created_at: new Date().toISOString(),
          customer_name: data.customer_name,
          description: data.description,
          license_plate: data.license_plate,
          payment_method: data.payment_method,
          receipt_url: data.receipt_url,
          status: data.status,
          transaction_date: data.transaction_date,
          type: data.type,
        });

      if (error) throw error;

      toast.success("Transaction added successfully");
      setOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Type</Label>
            <Select {...register("type")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TransactionType.INCOME}>Income</SelectItem>
                <SelectItem value={TransactionType.EXPENSE}>Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Agreement Number</Label>
            <Input {...register("agreement_number")} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input type="number" {...register("amount")} />
          </div>
          <div>
            <Label>Category</Label>
            <Input {...register("category_id")} />
          </div>
          <div>
            <Label>Customer Name</Label>
            <Input {...register("customer_name")} />
          </div>
          <div>
            <Label>Description</Label>
            <Input {...register("description")} />
          </div>
          <div>
            <Label>License Plate</Label>
            <Input {...register("license_plate")} />
          </div>
          <div>
            <Label>Payment Method</Label>
            <Input {...register("payment_method")} />
          </div>
          <div>
            <Label>Receipt URL</Label>
            <Input {...register("receipt_url")} />
          </div>
          <div>
            <Label>Status</Label>
            <Input {...register("status")} />
          </div>
          <div>
            <Label>Transaction Date</Label>
            <Input type="date" {...register("transaction_date")} />
          </div>
          <Button type="submit">Save Transaction</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
