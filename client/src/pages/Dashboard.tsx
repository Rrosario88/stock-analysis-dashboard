import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import StockChart from "@/components/StockChart";
import NewsTimeline from "@/components/NewsTimeline";
import AnalysisCard from "@/components/AnalysisCard";
import PriceAlerts from "@/components/PriceAlerts";
import EarningsDates from "@/components/EarningsDates";
import { fetchStockData, fetchNews, fetchAnalysis, fetchEarningsDates, fetchCompanyInfo } from "@/lib/api";
import CompanyInfo from "@/components/CompanyInfo";

export default function Dashboard() {
  const [ticker, setTicker] = useState("AAPL");

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["/api/stock", ticker],
    queryFn: () => fetchStockData(ticker),
    enabled: !!ticker,
  });

  const { data: companyInfo, isLoading: companyLoading } = useQuery({
    queryKey: ["/api/company", ticker],
    queryFn: () => fetchCompanyInfo(ticker),
    enabled: !!ticker,
  });

  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news", ticker],
    queryFn: () => fetchNews(ticker),
    enabled: !!ticker,
  });

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/analysis", ticker],
    queryFn: () => fetchAnalysis(ticker),
    enabled: !!ticker,
  });

  const { data: earningsDates, isLoading: earningsLoading } = useQuery({
    queryKey: ["/api/earnings", ticker],
    queryFn: () => fetchEarningsDates(ticker),
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <CompanyInfo
                ticker={ticker}
                info={companyInfo}
                isLoading={companyLoading}
              />
              <Card>
                <CardHeader>
                  <CardTitle>Price History</CardTitle>
                </CardHeader>
                <CardContent>
                  <StockChart data={stockData} isLoading={stockLoading} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <EarningsDates 
                ticker={ticker}
                dates={earningsDates}
                isLoading={earningsLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisCard analysis={analysis} isLoading={analysisLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent News</CardTitle>
              </CardHeader>
              <CardContent>
                <NewsTimeline news={newsData} isLoading={newsLoading} />
              </CardContent>
            </Card>
          </div>

          <PriceAlerts ticker={ticker} />
        </div>
      </div>
    </div>
  );
}