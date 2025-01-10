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

export async function fetchEarningsDates(ticker: string) {
  const response = await fetch(`${API_BASE}/earnings/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch earnings dates');
  }
  return response.json();
}

export async function fetchCompanyInfo(ticker: string) {
  const response = await fetch(`${API_BASE}/company/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch company info');
  }
  return response.json();
}