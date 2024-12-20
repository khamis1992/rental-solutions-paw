import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrentInstallmentCard } from "./installment/CurrentInstallmentCard";
import { InstallmentImport } from "./installment/InstallmentImport";
import { InstallmentSummary } from "./installment/InstallmentSummary";
import { InstallmentCharts } from "./installment/InstallmentCharts";
import { useInstallmentData } from "./installment/useInstallmentData";

export const InstallmentAnalysis = () => {
  const { data: installmentData, isLoading } = useInstallmentData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const insights = installmentData?.analytics?.insights;
  const recommendations = installmentData?.analytics?.recommendations || [];

  const performanceData = installmentData?.payments?.reduce((acc: any, payment) => {
    const month = new Date(payment.created_at).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = {
        month,
        onTime: 0,
        late: 0,
        defaulted: 0,
        earlyPayment: 0,
        totalAmount: 0,
      };
    }

    acc[month].totalAmount += Number(payment.amount_paid || 0);

    if (payment.early_payment_discount > 0) {
      acc[month].earlyPayment++;
    } else if (payment.late_fee_applied > 0) {
      acc[month].late++;
    } else if (payment.status === 'completed') {
      acc[month].onTime++;
    } else {
      acc[month].defaulted++;
    }

    return acc;
  }, {});

  return (
    <div className="grid gap-6">
      <CurrentInstallmentCard />
      
      <InstallmentImport />

      <InstallmentSummary {...installmentData.summary} />

      {insights && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI Analysis Insights</AlertTitle>
          <AlertDescription>{insights}</AlertDescription>
        </Alert>
      )}

      {recommendations.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <InstallmentCharts performanceData={Object.values(performanceData || {})} />
    </div>
  );
};