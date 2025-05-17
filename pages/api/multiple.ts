import type { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

const symbols = ['TCS.NS', 'INFY.NS', 'AAPL']; // You can dynamically update this too

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const data = await yahooFinance.quoteSummary(symbol, {
          modules: ['price', 'summaryDetail'],
        });
        return { symbol, data };
      })
    );

    res.status(200).json(results);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
