import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Mail, MessageSquare } from "lucide-react";

export const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Integrations</CardTitle>
          <CardDescription>
            Connect your payment processing services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Stripe</p>
              <p className="text-sm text-muted-foreground">Process credit card payments</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Services</CardTitle>
          <CardDescription>
            Configure your communication integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">SendGrid</p>
              <p className="text-sm text-muted-foreground">Email notification service</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Twilio</p>
              <p className="text-sm text-muted-foreground">SMS notification service</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage your API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Production API Key</p>
                <p className="text-sm text-muted-foreground">Last used 2 days ago</p>
              </div>
              <Button variant="outline">Regenerate</Button>
            </div>
            <div className="bg-muted p-2 rounded-md">
              <code className="text-sm">••••••••••••••••</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};