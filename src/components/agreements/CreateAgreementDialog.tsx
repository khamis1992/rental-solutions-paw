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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create New Agreement</DialogTitle>
          <DialogDescription>
            Create a new lease-to-own or short-term rental agreement.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <AgreementBasicInfo register={register} errors={errors} />
            
            <Separator className="my-6" />
            
            <CustomerInformation 
              register={register} 
              errors={errors}
              selectedCustomerId={selectedCustomerId}
              onCustomerSelect={setSelectedCustomerId}
              setValue={setValue}
            />
            
            <Separator className="my-6" />

            <VehicleAgreementDetails 
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
            
            <Separator className="my-6" />

            {agreementType === "lease_to_own" && (
              <>
                <LeaseToOwnFields
                  register={register}
                  watch={watch}
                />
                <Separator className="my-6" />
              </>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Late Fees & Penalties</h3>
              <div className="grid grid-cols-2 gap-4">
                <LateFeesPenaltiesFields register={register} />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                placeholder="Additional notes about the agreement..."
                className="min-h-[100px]"
                {...register("notes")} 
              />
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}