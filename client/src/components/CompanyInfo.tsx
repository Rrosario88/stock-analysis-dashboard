
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyInfo {
  name: string;
  sector: string;
  industry: string;
  marketCap: string;
  website: string;
}

interface CompanyInfoProps {
  ticker: string;
  info?: CompanyInfo;
  isLoading: boolean;
}

export default function CompanyInfo({ ticker, info, isLoading }: CompanyInfoProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Name:</strong> {info?.name || 'N/A'}</p>
          <p><strong>Sector:</strong> {info?.sector || 'N/A'}</p>
          <p><strong>Industry:</strong> {info?.industry || 'N/A'}</p>
          <p><strong>Market Cap:</strong> {info?.marketCap || 'N/A'}</p>
          <p><strong>Website:</strong> {info?.website ? (
            <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {info.website}
            </a>
          ) : 'N/A'}</p>
        </div>
      </CardContent>
    </Card>
  );
}
