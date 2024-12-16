import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2 } from "lucide-react";
import { useAgreementForm } from "./hooks/useAgreementForm";

export function CreateAgreementDialog() {
  const {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    updateMonthlyPayment,
    watch,
  } = useAgreementForm(() => {
    // Callback after successful creation
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <FilePlus2 className="mr-2 h-4 w-4" />
          New Agreement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
          <DialogDescription>
            Create a new lease-to-own or short-term rental agreement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agreementType">Agreement Type</Label>
              <Select
                {...register("agreementType")}
                onValueChange={(value) =>
                  register("agreementType").onChange({
                    target: { value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lease_to_own">Lease to Own</SelectItem>
                  <SelectItem value="short_term">Short Term Rental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select {...register("customerId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">John Doe</SelectItem>
                  <SelectItem value="2">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehicle</Label>
              <Select {...register("vehicleId")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">2024 Toyota Camry</SelectItem>
                  <SelectItem value="2">2023 Honda CR-V</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialMileage">Initial Mileage</Label>
              <Input
                type="number"
                {...register("initialMileage")}
                placeholder="Enter initial mileage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("totalAmount")}
                onChange={(e) => {
                  register("totalAmount").onChange(e);
                  updateMonthlyPayment();
                }}
              />
            </div>

            {agreementType === "lease_to_own" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("downPayment")}
                    onChange={(e) => {
                      register("downPayment").onChange(e);
                      updateMonthlyPayment();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("monthlyPayment")}
                    readOnly
                    value={watch("monthlyPayment") || ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("interestRate")}
                    onChange={(e) => {
                      register("interestRate").onChange(e);
                      updateMonthlyPayment();
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leaseDuration">Lease Duration (months)</Label>
                  <Input
                    type="number"
                    placeholder="12"
                    {...register("leaseDuration")}
                    onChange={(e) => {
                      register("leaseDuration").onChange(e);
                      updateMonthlyPayment();
                    }}
                  />
                </div>
              </>
            )}

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea placeholder="Additional notes..." {...register("notes")} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Agreement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
