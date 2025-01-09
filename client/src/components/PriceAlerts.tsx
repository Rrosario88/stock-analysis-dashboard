import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  ticker: string;
  threshold: number;
  type: 'above' | 'below';
}

interface PriceAlertsProps {
  ticker: string;
}

export default function PriceAlerts({ ticker }: PriceAlertsProps) {
  const [threshold, setThreshold] = useState<string>("");
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Connect to WebSocket server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.host}`);

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'alert') {
        toast({
          title: `Price Alert: ${data.data.ticker}`,
          description: `Price is ${data.data.alertType} ${data.data.threshold}! Current price: $${data.data.price.toFixed(2)}`,
          duration: 5000,
        });
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.current?.close();
    };
  }, [toast]);

  const addAlert = (alertType: 'above' | 'below') => {
    if (!threshold || isNaN(Number(threshold))) {
      toast({
        title: "Invalid threshold",
        description: "Please enter a valid number",
        variant: "destructive",
      });
      return;
    }

    const newAlert: Alert = {
      ticker,
      threshold: Number(threshold),
      type: alertType,
    };

    // Send subscription message
    ws.current?.send(JSON.stringify({
      type: 'subscribe',
      ticker: newAlert.ticker,
      threshold: newAlert.threshold,
      alertType: newAlert.type,
    }));

    setActiveAlerts((prev) => [...prev, newAlert]);
    setThreshold("");
  };

  const removeAlert = (alert: Alert) => {
    // Send unsubscribe message
    ws.current?.send(JSON.stringify({
      type: 'unsubscribe',
      ticker: alert.ticker,
      threshold: alert.threshold,
      alertType: alert.type,
    }));

    setActiveAlerts((prev) =>
      prev.filter(
        (a) =>
          !(
            a.ticker === alert.ticker &&
            a.threshold === alert.threshold &&
            a.type === alert.type
          )
      )
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Price threshold..."
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-32"
            />
            <Button onClick={() => addAlert('above')} variant="outline">
              Alert Above
            </Button>
            <Button onClick={() => addAlert('below')} variant="outline">
              Alert Below
            </Button>
          </div>

          <div className="space-y-2">
            {activeAlerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-muted p-2 rounded"
              >
                <div className="flex items-center gap-2">
                  {alert.type === 'above' ? (
                    <Bell className="h-4 w-4 text-green-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-red-500" />
                  )}
                  <span>
                    {alert.type === 'above' ? 'Above' : 'Below'} ${alert.threshold}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAlert(alert)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}