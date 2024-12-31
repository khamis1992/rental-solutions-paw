import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

export const AutomationSettings = () => {
  const [autoReminders, setAutoReminders] = useState(true);
  const [autoEscalation, setAutoEscalation] = useState(true);
  const [autoDocGen, setAutoDocGen] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Automation Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Automatic Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Send automatic reminders for pending tasks and deadlines
            </p>
          </div>
          <Switch
            checked={autoReminders}
            onCheckedChange={setAutoReminders}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Automatic Escalation</Label>
            <p className="text-sm text-muted-foreground">
              Automatically escalate cases based on defined criteria
            </p>
          </div>
          <Switch
            checked={autoEscalation}
            onCheckedChange={setAutoEscalation}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Document Generation</Label>
            <p className="text-sm text-muted-foreground">
              Automatically generate documents from templates
            </p>
          </div>
          <Switch
            checked={autoDocGen}
            onCheckedChange={setAutoDocGen}
          />
        </div>
      </CardContent>
    </Card>
  );
};