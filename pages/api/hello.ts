import type { NextApiRequest, NextApiResponse } from 'next';
import { enrichPortfolio } from '../api/practice';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const data = await enrichPortfolio();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error enriching portfolio:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
