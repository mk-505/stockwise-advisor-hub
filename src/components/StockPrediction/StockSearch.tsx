
import React, { useState } from 'react';
import { SearchIcon, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StockSearchProps {
  onSearch: (ticker: string) => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch }) => {
  const [ticker, setTicker] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticker.trim()) {
      onSearch(ticker.trim().toUpperCase());
    }
  };
  
  const popularTickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
  
  return (
    <div className="finance-card p-4">
      <h2 className="text-lg font-semibold mb-2">Search Stock</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="Enter stock ticker (e.g. AAPL)"
            className="pl-9"
          />
          {ticker && (
            <XCircle 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer" 
              onClick={() => setTicker('')}
            />
          )}
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Popular Stocks</h3>
        <div className="flex flex-wrap gap-2">
          {popularTickers.map((t) => (
            <Button 
              key={t} 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setTicker(t);
                onSearch(t);
              }}
            >
              {t}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockSearch;
