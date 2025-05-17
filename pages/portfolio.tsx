import PortfolioTable from '../components/PortofolioTable';
import { portfolioData } from '../pages/api/portfolioData';

const stockData = {}; // You need to fetch or prepare this correctly

export default function PortfolioPage() {
  return (
    <PortfolioTable
      portfolioData={portfolioData}
      stockData={stockData}
    />
  );
}
