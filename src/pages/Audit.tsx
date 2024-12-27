import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Audit = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Audit</h1>
        <p className="text-muted-foreground">
          This feature has been temporarily removed as part of the Finance module refactoring.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Audit;