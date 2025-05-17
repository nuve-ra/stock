// data/types.ts

export interface StockHolding {
    stockName: string;
    exchange: string;
    symbol: string;
    purchasePrice: number;
    quantity: number;
  }
  
  export interface PortfolioTableProps {
    stockData: { [symbol: string]: { cmp: number; peRatio: number | null; latestEarnings: string } };
    portfolioData: StockHolding[];
  }
  