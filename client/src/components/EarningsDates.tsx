import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";

interface EarningsDate {
  date: string;
  estimate: string;
}

interface EarningsDatesProps {
  ticker: string;
  dates?: EarningsDate[];
  isLoading: boolean;
}

export default function EarningsDates({ ticker, dates, isLoading }: EarningsDatesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dates?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming earnings dates available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dates.map((earning, index) => (
            <div key={index} className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(earning.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estimated EPS: {earning.estimate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
