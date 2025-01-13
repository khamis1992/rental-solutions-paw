import React from 'react';
import { PaymentHistory } from "@/components/finance/types/transaction.types";

interface InstallmentAnalysisProps {
  payments: PaymentHistory[];
}

const InstallmentAnalysis: React.FC<InstallmentAnalysisProps> = ({ payments }) => {
  const calculateMetrics = (payments: PaymentHistory[]) => {
    return {
      totalPayments: payments.length,
      onTimePayments: payments.filter(p => 
        new Date(p.actual_payment_date) <= new Date(p.original_due_date)
      ).length,
      latePayments: payments.filter(p => 
        new Date(p.actual_payment_date) > new Date(p.original_due_date)
      ).length,
      totalLateFees: payments.reduce((sum, p) => sum + (p.late_fee_applied || 0), 0),
    };
  };

  const metrics = calculateMetrics(payments);

  return (
    <div>
      <h2>Installment Analysis</h2>
      <div>Total Payments: {metrics.totalPayments}</div>
      <div>On-Time Payments: {metrics.onTimePayments}</div>
      <div>Late Payments: {metrics.latePayments}</div>
      <div>Total Late Fees: {metrics.totalLateFees}</div>
    </div>
  );
};

export default InstallmentAnalysis;
