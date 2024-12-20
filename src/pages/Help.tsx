import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GettingStartedGuide } from "@/components/help/GettingStartedGuide";
import { VehicleManagementGuide } from "@/components/help/VehicleManagementGuide";
import { CustomerManagementGuide } from "@/components/help/CustomerManagementGuide";
import { AgreementManagementGuide } from "@/components/help/AgreementManagementGuide";
import { SystemFeaturesGuide } from "@/components/help/SystemFeaturesGuide";
import { TechnicalFeaturesGuide } from "@/components/help/TechnicalFeaturesGuide";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const Help = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Help Center</h1>
            <p className="text-muted-foreground mt-1">
              Find comprehensive guides and learn how to use Rental Solutions effectively.
            </p>
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="print:hidden"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Documentation
          </Button>
        </div>

        <Tabs defaultValue="getting-started" className="space-y-4">
          <TabsList className="print:hidden">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="system-features">System Features</TabsTrigger>
            <TabsTrigger value="technical-features">Technical Features</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicle Management</TabsTrigger>
            <TabsTrigger value="customers">Customer Management</TabsTrigger>
            <TabsTrigger value="agreements">Agreements</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <GettingStartedGuide />
          </TabsContent>

          <TabsContent value="system-features">
            <SystemFeaturesGuide />
          </TabsContent>

          <TabsContent value="technical-features">
            <TechnicalFeaturesGuide />
          </TabsContent>

          <TabsContent value="vehicles">
            <VehicleManagementGuide />
          </TabsContent>

          <TabsContent value="customers">
            <CustomerManagementGuide />
          </TabsContent>

          <TabsContent value="agreements">
            <AgreementManagementGuide />
          </TabsContent>
        </Tabs>

        {/* Print-specific styles */}
        <style type="text/css" media="print">{`
          @page {
            size: auto;
            margin: 20mm;
          }

          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Show all content when printing */
            [role="tabpanel"] {
              display: block !important;
              opacity: 1 !important;
              visibility: visible !important;
            }

            /* Add section titles for print */
            [role="tabpanel"]::before {
              content: attr(aria-label);
              display: block;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 16px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 8px;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Help;