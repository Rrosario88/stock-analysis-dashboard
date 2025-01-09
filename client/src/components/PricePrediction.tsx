import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface PricePredictionProps {
  ticker: string;
  predictions?: {
    date: string;
    actual?: number;
    predicted: number;
  }[];
  isLoading: boolean;
}

export default function PricePrediction({ ticker, predictions, isLoading }: PricePredictionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!predictions?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            No prediction data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Predictions (Next 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={predictions}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
              className="text-sm"
            />
            <YAxis className="text-sm" />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-2 shadow-lg">
                    <p className="font-medium">
                      {new Date(data.date).toLocaleDateString()}
                    </p>
                    {data.actual !== undefined && (
                      <p className="text-primary">
                        Actual: ${data.actual.toFixed(2)}
                      </p>
                    )}
                    <p className="text-blue-500">
                      Predicted: ${data.predicted.toFixed(2)}
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
            {predictions.some((p) => p.actual !== undefined) && (
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            )}
            <Line
              type="monotone"
              dataKey="predicted"
              name="Predicted Price"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
