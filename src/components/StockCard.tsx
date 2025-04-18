
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  data: number[];
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ 
  symbol, 
  name, 
  price, 
  change, 
  data,
  onClick 
}) => {
  const isPositive = change >= 0;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "finance-card p-4 transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-sm text-muted-foreground">{name}</p>
        </div>
        <div className={cn(
          "flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          isPositive ? "bg-finance-green/10 text-finance-green" : "bg-finance-red/10 text-finance-red"
        )}>
          {isPositive ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
          {Math.abs(change).toFixed(2)}%
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        <span className="text-xl font-bold">${price.toFixed(2)}</span>
        <div className="w-24 h-12">
          <Sparklines data={data} height={30}>
            <SparklinesLine 
              style={{ 
                stroke: isPositive ? "#22c55e" : "#ef4444", 
                fill: "none", 
                strokeWidth: 2 
              }} 
            />
          </Sparklines>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
