import { Card } from "@/components/ui/card";
import { Steps } from "@/components/ui/steps";

export const StepByStepGuides = () => {
  const guides = [
    {
      title: "Creating a New Customer",
      steps: [
        "Click on 'Customers' in the main navigation",
        "Click the 'Add Customer' button",
        "Fill in the customer's personal information",
        "Upload required documents (ID and driver's license)",
        "Click 'Save' to create the customer profile"
      ]
    },
    {
      title: "Creating a New Agreement",
      steps: [
        "Navigate to the 'Agreements' page",
        "Click 'Create Agreement'",
        "Select a customer from the dropdown",
        "Choose an available vehicle",
        "Set the rental duration and payment terms",
        "Review and confirm the agreement details"
      ]
    },
    {
      title: "Generating Reports",
      steps: [
        "Go to the 'Reports & Analytics' section",
        "Select the desired report type",
        "Set the date range and filters",
        "Click 'Generate Report'",
        "Download or print the generated report"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Step-by-Step Guides</h2>
      <div className="grid gap-6">
        {guides.map((guide, index) => (
          <Card key={index} className="p-6">
            <h3 className="text-lg font-medium mb-4">{guide.title}</h3>
            <Steps items={guide.steps} />
          </Card>
        ))}
      </div>
    </div>
  );
};