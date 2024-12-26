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
import { FilePlus2 } from "lucide-react";
import { useAgreementForm } from "./hooks/useAgreementForm";
import { LeaseToOwnFields } from "./form/LeaseToOwnFields";
import { LateFeesPenaltiesFields } from "./form/LateFeesPenaltiesFields";
import { useState } from "react";
import { AgreementBasicInfo } from "./form/AgreementBasicInfo";
import { CustomerInformation } from "./form/CustomerInformation";
import { VehicleAgreementDetails } from "./form/VehicleAgreementDetails";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function CreateAgreementDialog() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    watch,
    setValue,
    errors,
  } = useAgreementForm(() => {
    setOpen(false);
    setSelectedCustomerId("");
    toast.success("Agreement created successfully");
  });

  const handleFormSubmit = async (data: any) => {
    try {
      console.log("Form submission started with data:", data);
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
          <DialogDescription>
            Create a new lease-to-own or short-term rental agreement.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <AgreementBasicInfo register={register} errors={errors} />
          
          <CustomerInformation 
            register={register} 
            errors={errors}
            selectedCustomerId={selectedCustomerId}
            onCustomerSelect={setSelectedCustomerId}
            setValue={setValue}
          />

          <VehicleAgreementDetails 
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />

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

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Create Agreement</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </>
              ) : (
                "Create Agreement"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
