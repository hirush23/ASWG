import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Bell, AlertTriangle, Shield, CheckCircle, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "threat" | "phishing" | "warning" | "info";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  transactionId?: string;
}

export default function AlertsPage() {
  const { toast } = useToast();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/alerts/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Dismissed",
        description: "The alert has been removed.",
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/alerts/read-all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "All Alerts Marked as Read",
      });
    },
  });

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "threat":
        return <AlertTriangle className="h-5 w-5 text-high-risk" />;
      case "phishing":
        return <Shield className="h-5 w-5 text-high-risk" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-medium-risk" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getAlertBadge = (type: Alert["type"]) => {
    switch (type) {
      case "threat":
        return (
          <Badge variant="destructive" className="text-xs">
            Threat
          </Badge>
        );
      case "phishing":
        return (
          <Badge variant="destructive" className="text-xs">
            Phishing
          </Badge>
        );
      case "warning":
        return (
          <Badge className="text-xs bg-medium-risk/20 text-medium-risk border-medium-risk/30">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Info
          </Badge>
        );
    }
  };

  const unreadCount = alerts?.filter((a) => !a.read).length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Security Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Stay informed about potential threats</p>
        </div>
        {alerts && alerts.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={unreadCount === 0}
            data-testid="button-mark-all-read"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={cn(
                "overflow-visible transition-colors",
                !alert.read && "border-l-4 border-l-primary"
              )}
              data-testid={`card-alert-${alert.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                      alert.type === "threat" && "bg-high-risk/10",
                      alert.type === "phishing" && "bg-high-risk/10",
                      alert.type === "warning" && "bg-medium-risk/10",
                      alert.type === "info" && "bg-primary/10"
                    )}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={cn("font-medium", !alert.read && "font-semibold")}>
                        {alert.title}
                      </h3>
                      {getAlertBadge(alert.type)}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!alert.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markReadMutation.mutate(alert.id)}
                        data-testid={`button-mark-read-${alert.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => dismissMutation.mutate(alert.id)}
                      className="text-muted-foreground hover:text-high-risk"
                      data-testid={`button-dismiss-${alert.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-safe opacity-50" />
            <h3 className="font-medium mb-1">No alerts</h3>
            <p className="text-sm text-muted-foreground">
              Your wallet is protected. We'll notify you of any suspicious activity.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
