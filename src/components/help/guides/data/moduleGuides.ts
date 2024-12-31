import { workflowGuides } from './workflowGuides';

export const moduleGuides = {
  dashboard: [
    {
      title: "Using the Dashboard",
      steps: [
        "Navigate to the Dashboard from the main menu",
        "View key metrics and statistics at the top",
        "Check recent activities in the activity feed",
        "Monitor alerts and notifications",
        "Access quick actions for common tasks"
      ]
    },
    {
      title: "Customizing Dashboard Views",
      steps: [
        "Click on the customize button in the top right",
        "Select which widgets to display",
        "Arrange widgets by dragging and dropping",
        "Save your customized layout",
        "Reset to default layout if needed"
      ]
    }
  ],
  legal: [
    {
      title: "Using the Workflow Builder",
      steps: [
        "Access the Workflow Builder from the Legal Management section",
        "Create new workflow templates for different case types",
        "Add and configure sequential steps",
        "Set up automation triggers and notifications",
        "Monitor workflow progress through the dashboard"
      ]
    },
    {
      title: "Example: Debt Collection Workflow",
      steps: [
        "Step 1: Initial Notice - Send formal payment request",
        "Step 2: Payment Reminder (7 days) - Automated follow-up",
        "Step 3: Final Warning (14 days) - Legal action notice",
        "Step 4: Legal Proceedings (30 days) - Court filing preparation",
        "Step 5: Case Resolution - Settlement or judgment tracking"
      ]
    },
    {
      title: "Example: Contract Review Workflow",
      steps: [
        "Step 1: Document Upload - Initial contract submission",
        "Step 2: Initial Review - Basic compliance check",
        "Step 3: Legal Analysis - Detailed terms review",
        "Step 4: Stakeholder Review - Get necessary approvals",
        "Step 5: Final Approval - Document completion"
      ]
    }
  ],
  workflow: workflowGuides,
  financial: [
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
    },
    {
      title: "Managing Fixed Costs",
      steps: [
        "Access the Finance module",
        "Go to Fixed Costs section",
        "Add or edit fixed cost items",
        "Set cost amount and frequency",
        "Save the changes"
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
    },
    {
      title: "Managing Vehicle Documents",
      steps: [
        "Open vehicle details",
        "Go to Documents tab",
        "Upload required documents",
        "Set document expiry dates",
        "Save document information"
      ]
    }
  ],
  reports: [
    {
      title: "Creating Custom Reports",
      steps: [
        "Navigate to Reports section",
        "Select 'Custom Report'",
        "Choose data points to include",
        "Set filters and parameters",
        "Generate and preview report",
        "Save report template if needed"
      ]
    },
    {
      title: "Analyzing Business Metrics",
      steps: [
        "Access Analytics dashboard",
        "Select time period",
        "Review key performance indicators",
        "Export data for further analysis",
        "Save custom views"
      ]
    }
  ]
};
