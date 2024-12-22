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
import { CustomerDocuments } from "./CustomerDocuments";
import { useState } from "react";

export function CreateAgreementDialog() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
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
    errors,
  } = useAgreementForm(() => {
    // Callback after successful creation
  });

  const handleVehicleSelect = (vehicleId: string) => {
    setValue('vehicleId', vehicleId);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
          <DialogDescription>
            Create a new lease-to-own or short-term rental agreement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Agreement Number - Read Only */}
            <div className="space-y-2">
              <Label htmlFor="agreementNumber">Agreement No.</Label>
              <Input
                id="agreementNumber"
                {...register("agreementNumber")}
                readOnly
                className="bg-gray-100"
              />
            </div>

            <AgreementTypeSelect register={register} />

            {/* Customer Information Section */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <CustomerSelect 
                  register={register} 
                  onCustomerSelect={setSelectedCustomerId}
                />
                
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    {...register("nationality", { required: "Nationality is required" })}
                    placeholder="Enter nationality"
                  />
                  {errors.nationality && (
                    <span className="text-sm text-red-500">{errors.nationality.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drivingLicense">Driving License No.</Label>
                  <Input
                    {...register("drivingLicense", { required: "Driving license is required" })}
                    placeholder="Enter driving license number"
                  />
                  {errors.drivingLicense && (
                    <span className="text-sm text-red-500">{errors.drivingLicense.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone No.</Label>
                  <Input
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^[0-9+\-\s()]*$/,
                        message: "Invalid phone number format"
                      }
                    })}
                    placeholder="Enter phone number"
                  />
                  {errors.phoneNumber && (
                    <span className="text-sm text-red-500">{errors.phoneNumber.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <span className="text-sm text-red-500">{errors.email.message}</span>
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    {...register("address", { required: "Address is required" })}
                    placeholder="Enter full address"
                  />
                  {errors.address && (
                    <span className="text-sm text-red-500">{errors.address.message}</span>
                  )}
                </div>
              </div>
            </div>

            {selectedCustomerId && <CustomerDocuments customerId={selectedCustomerId} />}

            {/* Vehicle and Agreement Details Section */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4">Vehicle & Agreement Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <VehicleSelect register={register} onVehicleSelect={handleVehicleSelect} />

                <div className="space-y-2">
                  <Label htmlFor="agreementDuration">Agreement Duration (months)</Label>
                  <Input
                    type="number"
                    {...register("agreementDuration", {
                      required: "Duration is required",
                      min: { value: 1, message: "Duration must be at least 1 month" }
                    })}
                    placeholder="Enter duration in months"
                  />
                  {errors.agreementDuration && (
                    <span className="text-sm text-red-500">{errors.agreementDuration.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentAmount">Rent Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("rentAmount", {
                      required: "Rent amount is required",
                      min: { value: 0, message: "Rent amount must be positive" }
                    })}
                    placeholder="Enter rent amount"
                  />
                  {errors.rentAmount && (
                    <span className="text-sm text-red-500">{errors.rentAmount.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="downPayment">Down Payment</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("downPayment")}
                    placeholder="Enter down payment amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initialMileage">Initial Mileage</Label>
                  <Input
                    type="number"
                    {...register("initialMileage", { required: "Initial mileage is required" })}
                    placeholder="Enter initial mileage"
                  />
                  {errors.initialMileage && (
                    <span className="text-sm text-red-500">{errors.initialMileage.message}</span>
                  )}
                </div>
              </div>
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

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
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