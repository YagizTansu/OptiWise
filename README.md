# OptiWise

OptiWise is a comprehensive financial optimization and portfolio management platform designed to provide powerful market insights, robust risk assessment, advanced screening, and data-driven investment strategies. The application is divided into a robust NestJS backend for financial data aggregation and a feature-rich Next.js frontend for an intuitive user experience.

## System Architecture

OptiWise is built with a modern, decoupled architecture:
- **Frontend**: A Next.js (React) web application utilizing Material UI and Supabase.
- **Backend**: A NestJS API service powered by the `yahoo-finance2` library to serve real-time and historical market data.

---

## 🖥 Frontend

The OptiWise Frontend is a highly interactive, responsive web application that provides users with a complete suite of financial tools.

### Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Material UI (@mui/material)](https://mui.com/) & Emotion
- **Authentication & Database**: [Supabase](https://supabase.com/)
- **Charts & Data Visualization**: [Chart.js](https://www.chartjs.org/) & React Sparklines
- **Routing**: Next.js App/Pages Router & React Router DOM

### Key Features
- **Dashboard & Terminal**: A main terminal interface for quickly assessing market conditions.
- **Market Insights & Analytics**: Real-time insights, hot topics, and country economics.
- **Quantum Screener**: Advanced filtering and screening tools to find top-performing assets.
- **COT Reports & Currency Forecasting**: Deep dives into Commitments of Traders data and forex trends.
- **Risk Assessment & Breakeven Analysis**: Tools to calculate risk and manage portfolio breakeven points.
- **AI Assistant**: Built-in intelligent assistant for answering financial queries and providing guidance.

### Setup & Installation
```bash
cd Frontend
npm install
npm run dev
```

---

## ⚙️ Backend

The OptiWise Backend is a highly scalable RESTful API built to fetch, transform, and serve complex financial data to the frontend in real-time.

### Tech Stack
- **Framework**: [NestJS](https://nestjs.com/)
- **Financial Data Provider**: [yahoo-finance2](https://github.com/gadicc/node-yahoo-finance2)
- **Validation**: `class-validator` & `class-transformer`
- **Testing**: Jest

### Key API Capabilities
The backend primarily operates through the `/api/finance` endpoints:
- **Market Data**: Real-time quotes, historical data, and deep chart data with customizable intervals (1m to 1mo).
- **Fundamentals**: Time-series fundamentals including financials, balance sheets, and cash flows (Annual/Quarterly/Trailing).
- **Market Movers**: Endpoints for daily gainers, losers, and most active stocks.
- **Search & Insights**: Symbol search, fuzzy matching, analyst recommendations, and company snapshot insights.
- **Quote Summaries**: Modular quote data including asset profiles, earnings trends, sec filings, and fund ownership information.

### Setup & Installation
```bash
cd Backend
npm install
npm run start:dev
```

---

## 🚀 Getting Started (Full Stack)

To run the full OptiWise platform locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/OptiWise.git
   cd OptiWise
   ```

2. **Start the Backend server**:
   ```bash
   cd Backend
   npm install
   npm run start:dev
   ```
   *The backend will typically start on `http://localhost:3000` or `http://localhost:3001`.*

3. **Start the Frontend client** (in a new terminal):
   ```bash
   cd Frontend
   npm install
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## 🛡 License & Disclaimer
This project is licensed under the MIT License.
**Disclaimer**: OptiWise provides financial data analysis tools but does not offer financial advice. Always perform your own due diligence before making investment decisions.
