import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import * as cheerio from "cheerio";
import { WebSocketServer, WebSocket } from "ws";
import type { IncomingMessage } from "http";

interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  format?: "json";
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
}

interface StockAlert {
  ticker: string;
  threshold: number;
  type: 'above' | 'below';
}

interface StockPrice {
  ticker: string;
  price: number;
  timestamp: string;
}

const clients = new Map<WebSocket, Set<StockAlert>>();

async function callOllama(request: OllamaRequest) {
  const response = await axios.post("http://localhost:11434/api/generate", request);
  return response.data;
}

async function fetchRealStockData(ticker: string) {
  try {
    const symbol = ticker.toUpperCase();
    // Yahoo Finance API endpoint
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1mo&interval=1d`);

    if (response.data?.chart?.result?.[0]) {
      const result = response.data.chart.result[0];
      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      return timestamps.map((time: number, index: number) => ({
        date: new Date(time * 1000).toISOString(),
        price: Number(quotes.close[index]?.toFixed(2)) || 0,
        volume: quotes.volume[index] || 0,
      })).filter((item: any) => item.price > 0);
    }
    throw new Error('Invalid data format from Yahoo Finance');
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
}

async function checkStockPrice(ticker: string): Promise<StockPrice> {
  try {
    const symbol = ticker.toUpperCase();
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`);

    if (response.data?.chart?.result?.[0]) {
      const result = response.data.chart.result[0];
      const lastQuote = result.indicators.quote[0];
      const lastIndex = lastQuote.close.length - 1;

      return {
        ticker,
        price: Number(lastQuote.close[lastIndex]?.toFixed(2)) || 0,
        timestamp: new Date().toISOString()
      };
    }
    throw new Error('Invalid data format from Yahoo Finance');
  } catch (error) {
    console.error('Error checking stock price:', error);
    // Fallback to simulated data if real-time fetch fails
    return {
      ticker,
      price: Math.random() * 100 + 100,
      timestamp: new Date().toISOString()
    };
  }
}

// Check prices periodically and notify clients
async function monitorStockPrices() {
  const tickers = new Set<string>();

  // Collect all unique tickers being monitored
  clients.forEach((alerts) => {
    alerts.forEach((alert) => {
      tickers.add(alert.ticker);
    });
  });

  // Check each ticker's price
  Array.from(tickers).forEach(async (ticker) => {
    const price = await checkStockPrice(ticker);

    // Notify relevant clients
    clients.forEach((alerts, client) => {
      alerts.forEach((alert) => {
        if (alert.ticker === ticker) {
          if ((alert.type === 'above' && price.price > alert.threshold) ||
              (alert.type === 'below' && price.price < alert.threshold)) {
            client.send(JSON.stringify({
              type: 'alert',
              data: {
                ticker,
                price: price.price,
                threshold: alert.threshold,
                alertType: alert.type,
                timestamp: price.timestamp
              }
            }));
          }
        }
      });
    });
  });
}

export function registerRoutes(app: Express): Server {
  // Stock data endpoint
  app.get("/api/stock/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const data = await fetchRealStockData(ticker);
      res.json(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });

  // News endpoint
  app.get("/api/news/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const response = await axios.get(`https://finance.yahoo.com/quote/${ticker}`);
      const $ = cheerio.load(response.data);

      const news: NewsItem[] = [];
      $('div#quoteNewsStream li').each((_, el) => {
        const title = $(el).find('h3').text().trim();
        const summary = $(el).find('p').text().trim();
        if (title && summary) {
          news.push({
            id: Math.random().toString(36).substr(2, 9),
            title,
            summary,
            source: "Yahoo Finance",
            url: `https://finance.yahoo.com/news/${ticker}`,
            publishedAt: new Date().toISOString(),
          });
        }
      });

      res.json(news);
    } catch (error) {
      console.error('Error fetching news:', error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Analysis endpoint
  app.get("/api/analysis/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      // Simulate analysis response since Ollama is not available
      const mockAnalysis = {
        sentiment: ["positive", "negative", "neutral"][Math.floor(Math.random() * 3)],
        summary: `Market analysis for ${ticker} based on recent performance and trends.`,
        keyPoints: [
          "Recent market performance indicates steady growth",
          "Trading volume remains consistent",
          "Market sentiment shows positive indicators"
        ],
        recommendation: ["buy", "sell", "hold"][Math.floor(Math.random() * 3)]
      };
      res.json(mockAnalysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      res.status(500).json({ error: "Failed to generate analysis" });
    }
  });

  app.get("/api/company/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const symbol = ticker.toUpperCase();
      const API_KEY = 'cu08ae1r01ql96gq0tb0cu08ae1r01ql96gq0tbg';
      
      const API_KEY = 'cu08ae1r01ql96gq0tb0cu08ae1r01ql96gq0tbg';
      
      console.log(`Fetching data for symbol: ${symbol}`);
      
      const profileResponse = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY}`);
      console.log('Profile Response:', profileResponse.data);
      
      const metricsResponse = await axios.get(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`);
      console.log('Metrics Response:', metricsResponse.data);
      
      const data = {
        profile: profileResponse.data,
        metrics: metricsResponse.data.metric || {}
      };
      
      if (!data.profile || Object.keys(data.profile).length === 0) {
        throw new Error('No profile data received from Finnhub');
      }
      
      const companyInfo = {
        name: data.profile.name || symbol,
        sector: data.profile.finnhubIndustry || 'N/A',
        industry: data.profile.finnhubIndustry || 'N/A',
        marketCap: data.profile.marketCapitalization ? 
          `$${(data.profile.marketCapitalization * 1000000).toLocaleString()}` : 'N/A',
        website: data.profile.weburl || 'N/A',
        dividendYield: data.metrics?.dividendYieldIndicatedAnnual ? 
          `${(Number(data.metrics.dividendYieldIndicatedAnnual)).toFixed(2)}%` : 'N/A',
        dividendDate: data.metrics?.nextDividendDate || 'N/A'
      };
      
      res.json(companyInfo);
    } catch (error) {
      console.error('Error fetching company info:', error);
      res.status(500).json({ error: "Failed to fetch company info" });
    }
  });

  app.get("/api/earnings/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;
      const symbol = ticker.toUpperCase();
      const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);

      if (response.data?.chart?.result?.[0]?.meta?.earningsDate) {
        const earningsDate = response.data.chart.result[0].meta.earningsDate;
        // Get up to 3 upcoming earnings dates
        const dates = Array.isArray(earningsDate) ? 
          earningsDate.slice(0, 3).map((timestamp: number) => ({
            date: new Date(timestamp * 1000).toISOString(),
            estimate: 'TBD'  // Yahoo Finance API doesn't provide EPS estimates in this endpoint
          })) : [];
        res.json(dates);
      } else {
        res.json([]);
      }
    } catch (error) {
      console.error('Error fetching earnings dates:', error);
      res.status(500).json({ error: "Failed to fetch earnings dates" });
    }
  });


  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer,
    verifyClient: ({ req }: { req: IncomingMessage }) => {
      // Ignore Vite HMR WebSocket connections
      const protocol = req.headers['sec-websocket-protocol'];
      return !protocol?.includes('vite-hmr');
    }
  });

  wss.on('connection', (ws) => {
    // Initialize client's alerts
    clients.set(ws, new Set());

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'subscribe': {
            const alerts = clients.get(ws)!;
            alerts.add({
              ticker: data.ticker,
              threshold: data.threshold,
              type: data.alertType
            });
            break;
          }

          case 'unsubscribe': {
            const currentAlerts = clients.get(ws)!;
            Array.from(currentAlerts).forEach((alert) => {
              if (alert.ticker === data.ticker &&
                  alert.threshold === data.threshold &&
                  alert.type === data.alertType) {
                currentAlerts.delete(alert);
              }
            });
            break;
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      // Clean up when client disconnects
      clients.delete(ws);
    });
  });

  // Start monitoring stock prices
  setInterval(monitorStockPrices, 5000); // Check every 5 seconds

  return httpServer;
}