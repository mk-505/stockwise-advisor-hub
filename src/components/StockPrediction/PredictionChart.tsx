
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Calendar, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DataPoint {
  date: string;
  actual?: number;
  predicted: number;
  predicted_lstm?: number;
  predicted_bilstm?: number;
}

interface PredictionChartProps {
  data: DataPoint[];
  symbol: string;
  modelAccuracy: {
    lstm: number;
    bilstm: number;
  };
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border border-border rounded-md shadow-md">
        <p className="font-medium text-sm">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: ${entry.value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PredictionChart: React.FC<PredictionChartProps> = ({ data, symbol, modelAccuracy }) => {
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedModel, setSelectedModel] = useState('lstm');
  
  const timeRanges = ['1W', '1M', '3M', '6M', '1Y'];
  
  // Filter data based on selected time range
  const filteredData = () => {
    // For demo purposes, we're just returning all data
    // In a real app, you'd slice the data based on timeRange
    return data;
  };
  
  const currentData = filteredData();
  
  return (
    <div className="finance-card p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{symbol} Price Prediction</h2>
          <p className="text-sm text-muted-foreground">Prediction for next 7 days</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
            {timeRanges.map((range) => (
              <ToggleGroupItem key={range} value={range} size="sm">
                {range}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-2">
                <h3 className="font-medium">Custom Date Range</h3>
                <p className="text-sm text-muted-foreground">
                  Select a custom date range to view historical and predicted data
                </p>
                {/* Date picker would go here in a real app */}
                <div className="flex justify-end">
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="mb-4">
        <ToggleGroup 
          type="single" 
          value={selectedModel} 
          onValueChange={(value) => value && setSelectedModel(value)}
          className="justify-start"
        >
          <ToggleGroupItem value="lstm" className="flex items-center gap-1">
            LSTM
            <Popover>
              <PopoverTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <h3 className="font-medium">LSTM Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Long Short-Term Memory networks are capable of learning order dependence in sequence prediction problems.
                  </p>
                  <p className="text-sm font-medium">
                    Accuracy: {(modelAccuracy.lstm * 100).toFixed(2)}%
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </ToggleGroupItem>
          <ToggleGroupItem value="bilstm" className="flex items-center gap-1">
            Bi-LSTM
            <Popover>
              <PopoverTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <h3 className="font-medium">Bi-LSTM Model</h3>
                  <p className="text-sm text-muted-foreground">
                    Bidirectional LSTM processes data in both forward and backward directions, capturing patterns more effectively.
                  </p>
                  <p className="text-sm font-medium">
                    Accuracy: {(modelAccuracy.bilstm * 100).toFixed(2)}%
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={currentData}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }} 
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              domain={['auto', 'auto']}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual Price" 
              stroke="#9b87f5" 
              strokeWidth={2} 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey={selectedModel === 'lstm' ? 'predicted_lstm' : 'predicted_bilstm'} 
              name="Predicted Price" 
              stroke="#22c55e" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false} 
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="flex flex-col items-center p-2 border border-border rounded-md">
          <span className="text-xs text-muted-foreground">Current Price</span>
          <span className="font-bold">${currentData[currentData.length - 2]?.actual?.toFixed(2) || 'N/A'}</span>
        </div>
        <div className="flex flex-col items-center p-2 border border-border rounded-md">
          <span className="text-xs text-muted-foreground">Predicted Price</span>
          <span className="font-bold">${currentData[currentData.length - 1]?.predicted?.toFixed(2) || 'N/A'}</span>
        </div>
        <div className="flex flex-col items-center p-2 border border-border rounded-md">
          <span className="text-xs text-muted-foreground">Model</span>
          <span className="font-bold">{selectedModel.toUpperCase()}</span>
        </div>
        <div className="flex flex-col items-center p-2 border border-border rounded-md">
          <span className="text-xs text-muted-foreground">Accuracy</span>
          <span className="font-bold">
            {selectedModel === 'lstm' 
              ? `${(modelAccuracy.lstm * 100).toFixed(2)}%` 
              : `${(modelAccuracy.bilstm * 100).toFixed(2)}%`
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
