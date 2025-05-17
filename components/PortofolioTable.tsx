import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { StockHolding } from '../pages/api/types';
import { format } from 'date-fns';

type LiveStockData = {
  [symbol: string]: {
    cmp: number;
    peRatio: number | null;
    latestEarnings: string | null;
  };
};

type HistoricalDataMap = {
  [symbol: string]: Array<{
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }>;
};

interface PortfolioTableProps {
  portfolioData: StockHolding[];
  stockData: Record<string, any>;
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolioData, stockData }) => {
  const [liveData, setLiveData] = useState<LiveStockData>({});
  const [historicalData, setHistoricalData] = useState<HistoricalDataMap>({});
  const [selectedSector, setSelectedSector] = useState<string>('All');

  
  const sectors = Array.from(new Set(portfolioData.map(stock => stock.sector)));
  sectors.unshift('All');

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const symbols = portfolioData.map(stock => stock.symbol);
        const response = await axios.post('/api/stocks', { symbols });

        const mappedData: LiveStockData = {};
        response.data.forEach((stock: any) => {
          mappedData[stock.symbol] = {
            cmp: stock.cmp ?? 0,
            peRatio: stock.peRatio ?? null,
            latestEarnings: stock.earningsTimestamp
              ? format(new Date(stock.earningsTimestamp * 1000), 'MMM dd yyyy')
              : null,
          };
        });

        setLiveData(mappedData);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    const fetchHistoricalData = async () => {
      try {
        const symbols = portfolioData.map(stock => stock.symbol);
        const response = await axios.post('/api/stocks', {
          symbols,
          fetchHistory: true,
          days: 60,
        });

        const historicalMap: HistoricalDataMap = {};
        response.data.forEach((item: any) => {
          historicalMap[item.symbol] = item.history;
        });

        setHistoricalData(historicalMap);
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    };

    fetchLiveData();
    fetchHistoricalData();
  }, [portfolioData]);

  const filteredPortfolio = selectedSector === 'All'
    ? portfolioData
    : portfolioData.filter(stock => stock.sector === selectedSector);

  
  const totalInvestment = filteredPortfolio.reduce(
    (acc, stock) => acc + stock.purchasePrice * stock.quantity,
    0
  );

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-4 py-3 rounded shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-semibold">📊 My Portfolio Dashboard</h1>
        <ul className="flex space-x-4 text-sm">
          <li className="hover:underline cursor-pointer">Home</li>
          <li className="hover:underline cursor-pointer">Add Stock</li>
        </ul>
      </nav>
      <div className="mt-4 px-4">
        <label htmlFor="sector-select" className="font-semibold mr-2">Filter by Sector:</label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="border border-gray-400 rounded px-2 py-1"
        >
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl shadow-md border border-gray-300 px-4 py-3">
        <img src="/finance.png" alt="Portfolio" className="w-6 h-6 rounded-full filter drop-shadow-lg inline-block mr-2" />
        <h2 className="text-xl font-semibold border border-gray-400 rounded-lg px-2 py-1 text-blue-500 filter drop-shadow-[0_4px_6px_rgba(59,130,246,0.6)] inline-block mb-4">
          Stock Portfolio
        </h2>

        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Particulars</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3">Purchase Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Investment</th>
              <th className="px-4 py-3">Portfolio (%)</th>
              <th className="px-4 py-3">Exchange</th>
              <th className="px-4 py-3">CMP</th>
              <th className="px-4 py-3">Present Value</th>
              <th className="px-4 py-3">Gain/Loss</th>
              <th className="px-4 py-3">P/E Ratio</th>
              <th className="px-4 py-3">Latest Earnings</th>
              <th className="px-4 py-3">History Points</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortfolio.map((stock, index) => {
              const investment = stock.purchasePrice * stock.quantity;
              const portfolioPercent = ((investment / totalInvestment) * 100).toFixed(2);

              const cmp = liveData[stock.symbol]?.cmp ?? 0;
              const peRatio = liveData[stock.symbol]?.peRatio ?? '-';
              const latestEarnings = liveData[stock.symbol]?.latestEarnings ?? '-';

              const presentValue = cmp * stock.quantity;
              const gainLoss = presentValue - investment;
              const gainClass = gainLoss >= 0 ? 'text-green-600' : 'text-red-600';

              const historicalPoints = historicalData[stock.symbol]?.length ?? 0;

              return (
                <tr
                  key={stock.symbol}
                  className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50`}
                >
                  <td className="px-4 py-3 font-medium">{stock.stockName}</td>
                  <td className="px-4 py-3 text-center">{stock.sector}</td>
                  <td className="px-4 py-3 text-center">{stock.purchasePrice}</td>
                  <td className="px-4 py-3 text-center">{stock.quantity}</td>
                  <td className="px-4 py-3 text-center">{investment.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{portfolioPercent}%</td>
                  <td className="px-4 py-3 text-center">{stock.exchange}</td>
                  <td className="px-4 py-3 text-center">{cmp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">{presentValue.toFixed(2)}</td>
                  <td className={`px-4 py-3 text-center font-semibold ${gainClass}`}>
                    {gainLoss.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">{peRatio}</td>
                  <td className="px-4 py-3 text-center">{latestEarnings}</td>
                  <td className="px-4 py-3 text-center">{historicalPoints}</td>
                </tr>
              );
            })}
            {filteredPortfolio.length === 0 && (
              <tr>
                <td colSpan={13} className="text-center py-6 text-gray-500">
                  No stocks available for the selected sector.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;
