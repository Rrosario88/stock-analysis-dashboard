import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import * as cheerio from "cheerio";

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

async function callOllama(request: OllamaRequest) {
  const response = await axios.post("http://localhost:11434/api/generate", request);
  return response.data;
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
  return httpServer;
}