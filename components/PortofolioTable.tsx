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
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const symbols = portfolioData.map((stock) => stock.symbol);
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

  //sectors
  const sectors = Array.from(new Set(portfolioData.map(stock => stock.sector))).sort();

  // filter sector
  const filteredPortfolioData =
    selectedSector === 'All Sectors'
      ? portfolioData
      : portfolioData.filter(stock => stock.sector === selectedSector);

  const totalInvestment = filteredPortfolioData.reduce(
    (acc, stock) => acc + stock.purchasePrice * stock.quantity,
    0
  );

  return (
    <div>
     
      <nav className="bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 text-white px-4 py-3 rounded shadow-lg flex justify-between items-center">
        <h1 className="text-lg font-semibold">📊 My Portfolio Dashboard</h1>
        <ul className="flex space-x-4 text-sm">
          <li className="hover:underline cursor-pointer">Home</li>
          <li className="hover:underline cursor-pointer">Add Stock</li>
          <li className="hover:underline cursor-pointer">Settings</li>
        </ul>
      </nav>

  
      <div className="mt-4 mb-2">
        <label htmlFor="sector-select" className="mr-2 font-medium">
          Filter by Sector:
        </label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="All Sectors">All Sectors</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

     
      <div className="overflow-x-auto rounded-xl shadow-md border border-gray-300 hidden md:block">
        <img src="/finance.png" alt="Portfolio" className="w-6 h-6 rounded-full filter drop-shadow-lg" />
        <h2 className="text-xl font-semibold border border-gray-400 rounded-lg px-2 py-1 text-blue-500 filter drop-shadow-[0_4px_6px_rgba(59,130,246,0.6)] mb-2">
          Stock Portfolio
        </h2>

        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-100 text-xs text-gray-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Particulars</th>
              <th className="px-4 py-3">Purchase Price</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Investment</th>
              <th className="px-4 py-3">Portfolio (%)</th>
              <th className="px-4 py-3">Exchange</th>
              <th className="px-4 py-3">CMP</th>
              <th className="px-4 py-3">Present Value</th>
              <th className="px-4 py-3">Gain/Loss</th>

              
              <th className="px-4 py-3 hidden sm:table-cell">P/E Ratio</th>
              <th className="px-4 py-3 hidden sm:table-cell">Latest Earnings</th>
              <th className="px-4 py-3 hidden sm:table-cell">History Points</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortfolioData.map((stock, index) => {
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
                  <td className="px-4 py-3 text-center hidden sm:table-cell">{peRatio}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">{latestEarnings}</td>
                  <td className="px-4 py-3 text-center hidden sm:table-cell">{historicalPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Card view for small screens */}
      <div className="mt-4 space-y-4 md:hidden">
        {filteredPortfolioData.map((stock) => {
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
            <div
              key={stock.symbol}
              className="border rounded-lg shadow-md p-4 bg-white"
            >
              <h3 className="font-semibold text-lg mb-2">{stock.stockName}</h3>
              <p><strong>Purchase Price:</strong> {stock.purchasePrice}</p>
              <p><strong>Quantity:</strong> {stock.quantity}</p>
              <p><strong>Investment:</strong> {investment.toFixed(2)}</p>
              <p><strong>Portfolio %:</strong> {portfolioPercent}%</p>
              <p><strong>Exchange:</strong> {stock.exchange}</p>
              <p><strong>CMP:</strong> {cmp.toFixed(2)}</p>
              <p><strong>Present Value:</strong> {presentValue.toFixed(2)}</p>
              <p className={`${gainClass} font-semibold`}><strong>Gain/Loss:</strong> {gainLoss.toFixed(2)}</p>
              <p><strong>P/E Ratio:</strong> {peRatio}</p>
              <p><strong>Latest Earnings:</strong> {latestEarnings}</p>
              <p><strong>History Points:</strong> {historicalPoints}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioTable;
