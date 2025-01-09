import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Analysis {
  sentiment: "positive" | "negative" | "neutral";
  summary: string;
  keyPoints: string[];
  recommendation: string;
}

interface AnalysisCardProps {
  analysis?: Analysis;
  isLoading: boolean;
}

export default function AnalysisCard({ analysis, isLoading }: AnalysisCardProps) {
  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!analysis) {
    return <div className="text-center py-8">No analysis available</div>;
  }

  const sentimentColor = {
    positive: "bg-green-100 text-green-800",
    negative: "bg-red-100 text-red-800",
    neutral: "bg-gray-100 text-gray-800",
  }[analysis.sentiment];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className={sentimentColor}>
          {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
        </Badge>
      </div>

      <div>
        <h3 className="font-medium mb-2">Summary</h3>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </div>

      <div>
        <h3 className="font-medium mb-2">Key Points</h3>
        <ul className="list-disc list-inside space-y-1">
          {analysis.keyPoints.map((point, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium mb-2">Recommendation</h3>
        <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
      </div>
    </div>
  );
}
