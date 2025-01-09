import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StockData {
  date: string;
  price: number;
  volume: number;
}

interface StockChartProps {
  data?: StockData[];
  isLoading: boolean;
}

export default function StockChart({ data, isLoading }: StockChartProps) {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (!data?.length) {
    return <div className="h-[400px] flex items-center justify-center">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
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
                <p className="text-primary">
                  Price: ${data.price.toFixed(2)}
                </p>
                <p className="text-muted-foreground">
                  Volume: {data.volume.toLocaleString()}
                </p>
              </div>
            );
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
