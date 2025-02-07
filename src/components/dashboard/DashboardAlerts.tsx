
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Bell, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  type: 'vehicle' | 'payment' | 'maintenance';
  created_at: string;
  is_read: boolean;
  vehicle_id: string | null;
  customer_id: string | null;
}

export function DashboardAlerts() {
  const { data: alerts } = useQuery({
    queryKey: ["dashboard-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          id,
          title,
          description,
          priority,
          type,
          created_at,
          is_read,
          vehicle_id,
          customer_id
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Alert[];
    },
  });

  const getPriorityColor = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return "text-destructive border-destructive/20 bg-destructive/10";
      case 'medium':
        return "text-warning border-warning/20 bg-warning/10";
      case 'low':
        return "text-primary border-primary/20 bg-primary/10";
    }
  };

  const getTypeIcon = (type: Alert['type']) => {
    switch (type) {
      case 'vehicle':
        return AlertCircle;
      case 'payment':
        return Bell;
      case 'maintenance':
        return Clock;
    }
  };

  if (!alerts?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alerts & Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {alerts.map((alert) => {
              const Icon = getTypeIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                    !alert.is_read && "bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    getPriorityColor(alert.priority)
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={alert.priority === 'high' ? 'destructive' : alert.priority === 'medium' ? 'default' : 'secondary'}>
                        {alert.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium leading-none">{alert.title}</h4>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {alert.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
