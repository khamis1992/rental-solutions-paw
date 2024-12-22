import { Card } from "@/components/ui/card";
import { Steps } from "@/components/ui/steps";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const StepByStepGuides = () => {
  const guides = {
    customers: [
      {
        title: "Creating a New Customer",
        steps: [
          "Click on 'Customers' in the main navigation",
          "Click the 'Add Customer' button",
          "Fill in the customer's personal information (name, phone, address)",
          "Upload required documents (ID and driver's license)",
          "Review information and click 'Save' to create the customer profile"
        ]
      },
      {
        title: "Managing Customer Documents",
        steps: [
          "Navigate to the customer's profile",
          "Locate the Documents section",
          "Click 'Upload Document' for ID or license",
          "Select the file from your computer",
          "Wait for upload confirmation"
        ]
      }
    ],
    agreements: [
      {
        title: "Creating a New Agreement",
        steps: [
          "Navigate to the 'Agreements' page",
          "Click 'Create Agreement'",
          "Select a customer from the dropdown",
          "Choose an available vehicle",
          "Set the rental duration and payment terms",
          "Upload any required documents",
          "Review and confirm the agreement details"
        ]
      },
      {
        title: "Managing Payments",
        steps: [
          "Open the agreement details",
          "Go to the Payments tab",
          "Click 'Record Payment'",
          "Enter payment amount and method",
          "Save the payment record"
        ]
      }
    ],
    finance: [
      {
        title: "Recording a Transaction",
        steps: [
          "Go to the Finance section",
          "Click 'New Transaction'",
          "Select transaction type (Income/Expense)",
          "Choose the appropriate category",
          "Enter amount and description",
          "Upload any receipts or documentation",
          "Click 'Save Transaction'"
        ]
      },
      {
        title: "Generating Financial Reports",
        steps: [
          "Navigate to Reports & Analytics",
          "Select 'Financial Reports'",
          "Choose the report type",
          "Set the date range",
          "Apply any filters needed",
          "Click 'Generate Report'",
          "Download or print the report"
        ]
      }
    ],
    vehicles: [
      {
        title: "Adding a New Vehicle",
        steps: [
          "Go to the Vehicles section",
          "Click 'Add Vehicle'",
          "Enter vehicle details (make, model, year)",
          "Add license plate and VIN",
          "Upload vehicle photos",
          "Set vehicle status",
          "Save the vehicle record"
        ]
      },
      {
        title: "Scheduling Maintenance",
        steps: [
          "Select a vehicle from the list",
          "Go to Maintenance tab",
          "Click 'Schedule Maintenance'",
          "Select service type",
          "Set the maintenance date",
          "Add service details",
          "Confirm scheduling"
        ]
      }
    ],
    legal: [
      {
        title: "Managing Legal Documents",
        steps: [
          "Access the Legal section",
          "Select document type to generate",
          "Choose the relevant customer/agreement",
          "Review document details",
          "Generate the document",
          "Download or print as needed"
        ]
      },
      {
        title: "Handling Non-Compliant Customers",
        steps: [
          "Go to Legal > Non-Compliant Customers",
          "Review customer status",
          "Generate formal notice",
          "Record communication attempts",
          "Update compliance status"
        ]
      }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step-by-Step Guides</h2>
      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        {Object.entries(guides).map(([category, categoryGuides]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            {categoryGuides.map((guide, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-medium mb-4">{guide.title}</h3>
                <Steps items={guide.steps} />
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};