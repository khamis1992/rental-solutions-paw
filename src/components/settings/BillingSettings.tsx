import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2 } from "lucide-react";

export const BillingSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>
            Manage your payment methods and billing preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Credit Card ending in 4242</p>
              <p className="text-sm text-muted-foreground">Expires 12/24</p>
            </div>
            <Button variant="outline">Edit</Button>
          </div>
          <Button className="w-full">Add New Payment Method</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>
            Update your billing details and address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">AutoRent Pro LLC</p>
              <p className="text-sm text-muted-foreground">123 Business St, Suite 100</p>
              <p className="text-sm text-muted-foreground">San Francisco, CA 94107</p>
            </div>
            <Button variant="outline">Edit</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View your recent billing history and download invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: "Mar 1, 2024", amount: "$299.00", status: "Paid" },
              { date: "Feb 1, 2024", amount: "$299.00", status: "Paid" },
              { date: "Jan 1, 2024", amount: "$299.00", status: "Paid" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-600">{invoice.status}</span>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};