import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const SecuritySettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Password Settings</CardTitle>
          <CardDescription>
            Update your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Secure your account with two-factor authentication
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Review your recent login activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { device: "Chrome on Windows", location: "San Francisco, US", time: "2 minutes ago" },
              { device: "Safari on iPhone", location: "San Francisco, US", time: "1 hour ago" },
              { device: "Firefox on MacOS", location: "San Francisco, US", time: "2 days ago" },
            ].map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{session.device}</p>
                  <p className="text-sm text-muted-foreground">{session.location}</p>
                </div>
                <div className="text-sm text-muted-foreground">{session.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};