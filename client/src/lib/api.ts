const API_BASE = '/api';

export async function fetchStockData(ticker: string) {
  const response = await fetch(`${API_BASE}/stock/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stock data');
  }
  return response.json();
}

export async function fetchNews(ticker: string) {
  const response = await fetch(`${API_BASE}/news/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
}

export async function fetchAnalysis(ticker: string) {
  const response = await fetch(`${API_BASE}/analysis/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analysis');
  }
  return response.json();
}
