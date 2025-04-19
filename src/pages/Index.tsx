import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageLayout from '@/components/Layout/PageLayout';
import StockCard from '@/components/StockCard';
import TrendCard from '@/components/TrendCard';
import { LineChart, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stocksList } from '@/config/stocks';
import { fetchStockQuotes, type StockQuote } from '@/lib/stockApi';

const trendData = [
  { 
    title: 'Tech Sector Outlook', 
    description: 'Technology stocks showing strong momentum with AI advancements.', 
    type: 'positive' as const, 
    value: '+2.4% MTD' 
  },
  { 
    title: 'Consumer Staples', 
    description: 'Defensive stocks under pressure as consumers reduce spending.', 
    type: 'negative' as const, 
    value: '-1.1% MTD' 
  },
  { 
    title: 'Market Volatility', 
    description: 'VIX index indicates increased market uncertainty ahead.', 
    type: 'neutral' as const, 
    value: '19.32' 
  },
];

const Index = () => {
  const navigate = useNavigate();
  
  const { data: stockQuotes, isLoading } = useQuery({
    queryKey: ['stockQuotes'],
    queryFn: () => fetchStockQuotes(stocksList.map(stock => stock.symbol)),
    refetchInterval: 60000, // Refresh every minute
  });

  const getStockName = (symbol: string) => {
    return stocksList.find(stock => stock.symbol === symbol)?.name || symbol;
  };

  const handleStockClick = (symbol: string) => {
    navigate(`/predict?symbol=${symbol}`);
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Investor Center</h1>
        <p className="text-muted-foreground">AI-powered predictions and financial insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 finance-card p-6 finance-gradient relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Predict Stock Movements</h2>
            <p className="text-muted-foreground mb-4">
              Use our advanced AI models to forecast price movements and make informed investment decisions.
            </p>
            <Button onClick={() => navigate('/predict')} className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Start Predicting
            </Button>
          </div>
          <div className="absolute right-4 bottom-4 opacity-30">
            <LineChart className="h-32 w-32" />
          </div>
        </div>
        
        <div className="finance-card p-6 bg-finance-gold/10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">AI Financial Advisor</h2>
            <p className="text-muted-foreground mb-4">
              Get personalized investment advice and market insights from our AI assistant.
            </p>
            <Button onClick={() => navigate('/chat')} variant="outline" className="flex items-center gap-2">
              Chat Now
              <ArrowRightCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Popular Stocks</h2>
          <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={() => navigate('/predict')}>
            View All
            <ArrowRightCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stock data...</p>
            </div>
          ) : stockQuotes?.slice(0, 6).map((stock: StockQuote) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={getStockName(stock.symbol)}
              price={stock.price}
              change={stock.change}
              data={stock.data}
              onClick={() => handleStockClick(stock.symbol)}
            />
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Market Trends</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trendData.map((trend, index) => (
            <TrendCard
              key={index}
              title={trend.title}
              description={trend.description}
              type={trend.type}
              value={trend.value}
            />
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
