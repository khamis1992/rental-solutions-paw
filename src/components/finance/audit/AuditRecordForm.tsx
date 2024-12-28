import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type FormData = {
  audit_year: number;
  submission_deadline: string;
  auditor_name?: string;
  auditor_license_number?: string;
};

export function AuditRecordForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const createAuditRecord = useMutation({
    mutationFn: async (data: FormData) => {
      const { error } = await supabase.from("audit_records").insert([
        {
          ...data,
          status: "pending",
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-records"] });
      queryClient.invalidateQueries({ queryKey: ["audit-stats"] });
      toast.success("Audit record created successfully");
      reset();
    },
    onError: (error) => {
      toast.error("Failed to create audit record");
      console.error("Error creating audit record:", error);
    },
  });

  const onSubmit = (data: FormData) => {
    createAuditRecord.mutate(data);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audit_year">Audit Year</Label>
              <Input
                id="audit_year"
                type="number"
                {...register("audit_year", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submission_deadline">Submission Deadline</Label>
              <Input
                id="submission_deadline"
                type="date"
                {...register("submission_deadline", { required: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditor_name">Auditor Name</Label>
              <Input
                id="auditor_name"
                type="text"
                {...register("auditor_name")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auditor_license_number">License Number</Label>
              <Input
                id="auditor_license_number"
                type="text"
                {...register("auditor_license_number")}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createAuditRecord.isPending}
          >
            {createAuditRecord.isPending ? "Creating..." : "Create Audit Record"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}