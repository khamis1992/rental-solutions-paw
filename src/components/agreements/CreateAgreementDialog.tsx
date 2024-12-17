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
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2 } from "lucide-react";
import { useAgreementForm } from "./hooks/useAgreementForm";
import { AgreementTypeSelect } from "./form/AgreementTypeSelect";
import { CustomerSelect } from "./form/CustomerSelect";
import { VehicleSelect } from "./form/VehicleSelect";
import { LeaseToOwnFields } from "./form/LeaseToOwnFields";
import { LateFeesPenaltiesFields } from "./form/LateFeesPenaltiesFields";
import { supabase } from "@/integrations/supabase/client";

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
    setValue,
  } = useAgreementForm(() => {
    // Callback after successful creation
  });

  const handleVehicleSelect = async (vehicleId: string) => {
    try {
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('daily_rate')
        .eq('id', vehicleId)
        .single();

      if (vehicle) {
        // Set total amount to monthly rent (daily rate * 30)
        setValue('totalAmount', vehicle.daily_rate * 30);
      }
    } catch (error) {
      console.error('Error fetching vehicle rate:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors w-full">
          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500">
            <FilePlus2 className="h-5 w-5" />
          </div>
          <span className="font-medium">New Agreement</span>
        </button>
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
            <AgreementTypeSelect register={register} />
            <CustomerSelect register={register} />
            <VehicleSelect register={register} onVehicleSelect={handleVehicleSelect} />

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
              <LeaseToOwnFields
                register={register}
                updateMonthlyPayment={updateMonthlyPayment}
                watch={watch}
              />
            )}

            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Late Fees & Penalties</h3>
              <div className="grid grid-cols-2 gap-4">
                <LateFeesPenaltiesFields register={register} />
              </div>
            </div>

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