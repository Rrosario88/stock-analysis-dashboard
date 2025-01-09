import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { fetchStockData } from "@/lib/api";

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL");

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["/api/stock", ticker],
    queryFn: () => fetchStockData(ticker),
    enabled: !!ticker,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight">Stock Analysis Dashboard</h1>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ticker symbol..."
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="w-48"
              />
              <Button variant="default">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
              {stockLoading ? (
                <div>Loading...</div>
              ) : (
                <pre>{JSON.stringify(stockData, null, 2)}</pre>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}