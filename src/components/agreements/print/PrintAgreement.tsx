import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgreementEditor } from "./AgreementEditor";
import { Skeleton } from "@/components/ui/skeleton";

export const PrintAgreement = () => {
  const { id } = useParams<{ id: string }>();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ["agreement", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(
          `
          *,
          customer:customer_id(
            id,
            full_name,
            phone_number,
            email
          ),
          vehicle:vehicle_id(
            id,
            make,
            model,
            year,
            license_plate
          ),
          template:template_id(
            content
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  if (!agreement?.template?.content) {
    return <div>No template content found</div>;
  }

  // Replace template variables with actual values
  let content = agreement.template.content
    .replace(/{{customer\.customer_name}}/g, agreement.customer?.full_name || "")
    .replace(/{{customer\.phone_number}}/g, agreement.customer?.phone_number || "")
    .replace(/{{customer\.email}}/g, agreement.customer?.email || "")
    .replace(/{{vehicle\.make}}/g, agreement.vehicle?.make || "")
    .replace(/{{vehicle\.model}}/g, agreement.vehicle?.model || "")
    .replace(/{{vehicle\.year}}/g, agreement.vehicle?.year?.toString() || "")
    .replace(
      /{{vehicle\.license_plate}}/g,
      agreement.vehicle?.license_plate || ""
    )
    .replace(/{{agreement\.agreement_number}}/g, agreement.agreement_number || "")
    .replace(
      /{{agreement\.start_date}}/g,
      new Date(agreement.start_date).toLocaleDateString() || ""
    )
    .replace(
      /{{agreement\.end_date}}/g,
      new Date(agreement.end_date).toLocaleDateString() || ""
    );

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6 text-right">طباعة الاتفاقية</h2>
      <AgreementEditor initialContent={content} />
    </div>
  );
};