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

// Simulated price check (in a real app, this would fetch from a real API)
async function checkStockPrice(ticker: string): Promise<StockPrice> {
  return {
    ticker,
    price: Math.random() * 100 + 100, // Simulate price between 100-200
    timestamp: new Date().toISOString()
  };
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
      // Normally we'd use a proper financial API here
      // This is just a mock implementation
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        price: Math.random() * 100 + 100,
        volume: Math.floor(Math.random() * 1000000),
      }));
      res.json(mockData);
    } catch (error) {
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
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // Analysis endpoint
  app.get("/api/analysis/:ticker", async (req, res) => {
    try {
      const { ticker } = req.params;

      const prompt = `Analyze the current market situation for ${ticker} stock. 
        Provide a JSON response with the following structure:
        {
          "sentiment": "positive" | "negative" | "neutral",
          "summary": "brief market analysis",
          "keyPoints": ["point1", "point2", "point3"],
          "recommendation": "buy/sell/hold recommendation"
        }`;

      const analysis = await callOllama({
        model: "llama3",
        prompt,
        format: "json",
      });

      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate analysis" });
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