// types.ts (or inside your component file)
export interface StockHolding {
    stockName: string;
    exchange: string;
    symbol: string;
    purchasePrice: number;
    quantity: number;
    cmp?: number;               // Current Market Price (fetched later)
    peRatio?: number;           // P/E Ratio (fetched later)
    latestEarnings?: string;    // Earnings date or info (fetched later)
  }
  