import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle } from "lucide-react";

export const GettingStartedGuide = () => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Welcome to AutoRent Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Getting Started Guide</h3>
            <p className="text-muted-foreground">
              AutoRent Pro is your comprehensive solution for managing vehicle rentals efficiently. 
              Our platform streamlines every aspect of your rental business, from vehicle management 
              to customer relationships and financial tracking.
            </p>
            <div className="space-y-2">
              <h4 className="font-medium">Key Features:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Interactive Dashboard with real-time metrics and KPIs</li>
                <li>Complete vehicle fleet management system</li>
                <li>Customer relationship management (CRM)</li>
                <li>Automated rental agreement processing</li>
                <li>Maintenance scheduling and tracking</li>
                <li>Comprehensive financial reporting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use the sidebar navigation for quick access to all features
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Monitor the dashboard for important metrics and alerts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Set up automated notifications for maintenance and payments
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Regularly check the reports section for business insights
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Keep vehicle and customer information up to date
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Support Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We offer multiple channels of support to ensure you get the most out of AutoRent Pro:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  24/7 Email Support: support@autorentpro.com
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Phone Support: Mon-Fri, 9AM-6PM EST
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Video Tutorials Library
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Monthly Training Webinars
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};