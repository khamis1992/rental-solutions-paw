import { FinancialDashboard } from "@/components/finance/FinancialDashboard";

export default function Finance() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-secondary">Finance</h1>
          <p className="text-muted-foreground">Manage financial transactions and reports</p>
        </div>
        
        <FinancialDashboard />
      </div>
    </div>
  );
}