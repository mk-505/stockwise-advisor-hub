
import React from 'react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface TrendCardProps {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  value?: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ 
  title,
  description,
  type,
  value
}) => {
  const getIcon = () => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-finance-green" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-finance-red" />;
      default:
        return <Zap className="h-5 w-5 text-finance-blue" />;
    }
  };
  
  return (
    <div className="finance-card p-4">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      {value && (
        <div className={`text-lg font-semibold ${type === 'positive' ? 'text-finance-green' : type === 'negative' ? 'text-finance-red' : ''}`}>
          {value}
        </div>
      )}
    </div>
  );
};

export default TrendCard;
