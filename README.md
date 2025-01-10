# AI-Powered Stock Analysis Platform

A comprehensive financial analysis platform that combines real-time stock data with AI-powered insights to help investors make informed decisions.

## Features

- 📈 Real-time stock price tracking and visualization
- 🤖 AI-powered market analysis and sentiment assessment
- 📰 Latest news aggregation and summarization
- ⏰ Price alerts system with WebSocket real-time notifications
- 📅 Earnings call date tracking
- 📊 Interactive charts using Recharts
- 💡 Intelligent stock analysis using local LLM (Llama 3)

## Tech Stack

- **Frontend:**
  - React with TypeScript
  - TailwindCSS + shadcn/ui for styling
  - Recharts for data visualization
  - WebSocket for real-time updates
  - React Query for data fetching

- **Backend:**
  - Express.js server
  - WebSocket server for real-time price alerts
  - Yahoo Finance API integration
  - Ollama integration for AI analysis

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Ollama (for AI analysis)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rrosario88/stock-analysis-dashboard.git
cd stock-analysis-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`.

## Usage

1. **Stock Search:**
   - Enter a stock ticker symbol in the search bar
   - View real-time price data and historical charts

2. **Price Alerts:**
   - Set price thresholds for any stock
   - Receive real-time notifications when prices cross your set thresholds

3. **AI Analysis:**
   - View AI-generated market sentiment analysis
   - Get key insights and trading recommendations

4. **News Feed:**
   - Access latest news related to your selected stock
   - Read AI-summarized news content

5. **Earnings Tracking:**
   - View upcoming earnings call dates
   - Track estimated earnings per share

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.