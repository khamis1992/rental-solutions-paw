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

          <TabsContent value="getting-started" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">Getting Started</h2>
            <GettingStartedGuide />
          </TabsContent>

          <TabsContent value="system-features" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">System Features</h2>
            <SystemFeaturesGuide />
          </TabsContent>

          <TabsContent value="technical-features" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">Technical Features</h2>
            <TechnicalFeaturesGuide />
          </TabsContent>

          <TabsContent value="vehicles" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">Vehicle Management</h2>
            <VehicleManagementGuide />
          </TabsContent>

          <TabsContent value="customers" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">Customer Management</h2>
            <CustomerManagementGuide />
          </TabsContent>

          <TabsContent value="agreements" className="print-section">
            <h2 className="print-only text-2xl font-bold mb-4">Agreements</h2>
            <AgreementManagementGuide />
          </TabsContent>
        </Tabs>

        {/* Print-specific styles */}
        <style type="text/css" media="print">{`
          @page {
            size: A4;
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
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 2rem;
            }

            /* Hide navigation elements */
            nav, 
            header, 
            .print:hidden {
              display: none !important;
            }

            /* Show section titles for print */
            .print-only {
              display: block !important;
            }

            /* Ensure proper page breaks */
            .print-section {
              break-before: page;
            }

            /* Adjust typography for print */
            h1 {
              font-size: 24pt;
              margin-bottom: 1rem;
            }

            h2 {
              font-size: 20pt;
              margin-bottom: 0.8rem;
            }

            h3 {
              font-size: 16pt;
              margin-bottom: 0.6rem;
            }

            p, li {
              font-size: 11pt;
              line-height: 1.4;
            }

            /* Ensure cards break properly */
            .card {
              break-inside: avoid;
              page-break-inside: avoid;
              margin-bottom: 1rem;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default Help;