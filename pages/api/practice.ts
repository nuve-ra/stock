// utils/enrichPortfolio.ts
import yahooFinance from 'yahoo-finance2';
import { portfolioData } from './portfolioData';
import type { StockHolding } from '../../styles/types/type';

type EnrichedStockHolding = StockHolding & {
  currentPrice?: number;
  peRatio?: number;
  earningsDate?: string;
};

export const enrichPortfolio = async (): Promise<EnrichedStockHolding[]> => {
  const enrichedData: EnrichedStockHolding[] = [];

  for (const stock of portfolioData) {
    try {
      const quote = await yahooFinance.quoteSummary(stock.symbol, { modules: ['price', 'summaryDetail', 'calendarEvents'] });

      enrichedData.push({
        ...stock,
        currentPrice: quote.price?.regularMarketPrice,
        peRatio: quote.summaryDetail?.trailingPE,
        earningsDate: quote.calendarEvents?.earnings?.earningsDate?.[0]?.toString(),
      });
    } catch (error) {
      console.error(`Failed to fetch data for ${stock.symbol}:`, error);
      enrichedData.push(stock); // Push original if failed
    }
  }

  return enrichedData;
};
