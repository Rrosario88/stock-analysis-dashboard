import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface NewsTimelineProps {
  news?: NewsItem[];
  isLoading: boolean;
}

export default function NewsTimeline({ news, isLoading }: NewsTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!news?.length) {
    return <div className="text-center py-8">No news available</div>;
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium hover:underline"
                  >
                    {item.title}
                  </a>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.summary}
                </p>
                <div className="text-xs text-muted-foreground">
                  Source: {item.source}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
