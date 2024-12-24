import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LegalCaseFormFields } from "./form/LegalCaseFormFields";
import { useLegalCaseForm } from "./form/useLegalCaseForm";

interface CreateLegalCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLegalCaseDialog({
  open,
  onOpenChange,
}: CreateLegalCaseDialogProps) {
  const { form, isSubmitting, onSubmit } = useLegalCaseForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Legal Case</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <LegalCaseFormFields form={form} />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Create Case
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}