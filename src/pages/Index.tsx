
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/Layout/PageLayout';
import StockCard from '@/components/StockCard';
import TrendCard from '@/components/TrendCard';
import { LineChart, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 173.58, change: 0.89, data: [170, 168, 166, 169, 170, 173, 174] },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 410.34, change: 1.24, data: [400, 404, 405, 402, 406, 408, 410] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 164.76, change: -0.45, data: [167, 166, 165, 166, 164, 165, 164] },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.41, change: 0.67, data: [178, 180, 179, 181, 182, 181, 182] },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -1.34, data: [254, 253, 251, 249, 250, 247, 248] },
  { symbol: 'META', name: 'Meta Platforms', price: 508.76, change: 2.41, data: [492, 496, 500, 505, 506, 507, 509] },
];

const trendData = [
  { 
    title: 'Tech Sector Outlook', 
    description: 'Technology stocks showing strong momentum with AI advancements.', 
    type: 'positive', 
    value: '+2.4% MTD' 
  },
  { 
    title: 'Consumer Staples', 
    description: 'Defensive stocks under pressure as consumers reduce spending.', 
    type: 'negative', 
    value: '-1.1% MTD' 
  },
  { 
    title: 'Market Volatility', 
    description: 'VIX index indicates increased market uncertainty ahead.', 
    type: 'neutral', 
    value: '19.32' 
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
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
          {popularStocks.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
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
