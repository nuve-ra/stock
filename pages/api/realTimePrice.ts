import { NextApiRequest, NextApiResponse } from 'next';

type realTimeStockData = {
  symbol: string;
  cmp: number;
  peRatio: number | null;
  earningsTimestamp: number | null;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { symbols } = req.body;

  console.log('Symbols:', symbols);

  const livePrices: realTimeStockData[] = symbols.map((symbol: string) => ({
    symbol,
    cmp: Math.floor(Math.random() * 1000), // mock CMP price
    peRatio: 20 + Math.random() * 10,
    earningsTimestamp: Math.floor(Date.now() / 1000),
  }));

  res.status(200).json(livePrices);
}
