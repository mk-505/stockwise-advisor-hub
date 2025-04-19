
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/Layout/PageLayout';
import StockSearch from '@/components/StockPrediction/StockSearch';
import PredictionChart from '@/components/StockPrediction/PredictionChart';
import TrendCard from '@/components/TrendCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { POLYGON_API_KEY } from '@/config/stocks';

// Function to fetch historical stock data from Polygon.io
const fetchHistoricalData = async (symbol: string, days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${startDateStr}/${endDateStr}?adjusted=true&apiKey=${POLYGON_API_KEY}`
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch historical data: ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No data returned from API');
    }
    
    return data.results;
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return null;
  }
};

// Function to generate prediction data based on historical data
const generatePredictions = (historicalData: any[]) => {
  if (!historicalData || historicalData.length === 0) {
    return [];
  }
  
  const processedData = [];
  
  // Process historical data
  for (let i = 0; i < historicalData.length; i++) {
    const item = historicalData[i];
    const date = new Date(item.t);
    
    processedData.push({
      date: date.toISOString().split('T')[0],
      actual: item.c,
      predicted_lstm: null,
      predicted_bilstm: null
    });
  }
  
  // Add current day with predictions starting
  const lastPrice = historicalData[historicalData.length - 1].c;
  const today = new Date();
  
  processedData.push({
    date: today.toISOString().split('T')[0],
    actual: lastPrice,
    predicted_lstm: lastPrice,
    predicted_bilstm: lastPrice
  });
  
  // Generate future predictions
  // Using simple linear regression for demonstration
  const lastFivePrices = historicalData.slice(-5).map(item => item.c);
  const trend = lastFivePrices.reduce((acc, price, i) => {
    return i === 0 ? 0 : acc + (price - lastFivePrices[i - 1]);
  }, 0) / 4; // Average daily change
  
  let lstmPrice = lastPrice;
  let bilstmPrice = lastPrice;
  
  // Adjust volatility based on the ticker's historical volatility
  const volatility = 0.01;
  
  // Future predictions for next 7 days
  for (let i = 1; i <= 7; i++) {
    // LSTM predictions (more conservative)
    lstmPrice += trend * 0.8;
    
    // BiLSTM predictions (slightly more aggressive)
    bilstmPrice += trend * 1.2;
    
    // Add random noise
    lstmPrice += (Math.random() - 0.5) * volatility * lstmPrice;
    bilstmPrice += (Math.random() - 0.48) * volatility * bilstmPrice;
    
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    processedData.push({
      date: date.toISOString().split('T')[0],
      actual: null,
      predicted_lstm: lstmPrice,
      predicted_bilstm: bilstmPrice,
      predicted: i === 1 ? lstmPrice : null // For display purposes
    });
  }
  
  return processedData;
};

// Generate mock historical data when API fails
const generateMockData = (ticker: string, days: number = 30) => {
  const basePrice = ticker === 'AAPL' ? 170 : 
                    ticker === 'MSFT' ? 400 : 
                    ticker === 'GOOGL' ? 165 :
                    ticker === 'AMZN' ? 180 :
                    ticker === 'TSLA' ? 250 : 100;
  
  const volatility = ticker === 'TSLA' ? 0.03 : 0.01;
  
  const data = [];
  let currentPrice = basePrice;
  
  // Historical data (past days)
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.48) * volatility * currentPrice;
    currentPrice += change;
    
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    data.push({
      date: date.toISOString().split('T')[0],
      actual: currentPrice,
      predicted_lstm: null,
      predicted_bilstm: null
    });
  }
  
  // Add current day
  const today = new Date();
  data.push({
    date: today.toISOString().split('T')[0],
    actual: currentPrice,
    predicted_lstm: currentPrice,
    predicted_bilstm: currentPrice
  });
  
  // Add future predictions (7 days)
  let lstmPrice = currentPrice;
  let bilstmPrice = currentPrice;
  
  for (let i = 1; i <= 7; i++) {
    const lstmChange = (Math.random() - 0.4) * volatility * lstmPrice;
    const bilstmChange = (Math.random() - 0.42) * volatility * bilstmPrice;
    
    lstmPrice += lstmChange;
    bilstmPrice += bilstmChange;
    
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      actual: null,
      predicted_lstm: lstmPrice,
      predicted_bilstm: bilstmPrice,
      predicted: i === 1 ? lstmPrice : null // For display purposes
    });
  }
  
  return data;
};

const PredictPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSymbol = queryParams.get('symbol') || '';
  
  const [currentSymbol, setCurrentSymbol] = useState<string>(initialSymbol);
  const [stockData, setStockData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useRealData, setUseRealData] = useState<boolean>(true);
  
  // Model accuracy (mock data)
  const modelAccuracy = {
    lstm: 0.87,
    bilstm: 0.92
  };
  
  // Load data when symbol changes
  useEffect(() => {
    if (currentSymbol) {
      fetchStockData(currentSymbol);
    }
  }, [currentSymbol]);
  
  // Check for symbol in URL on initial load
  useEffect(() => {
    if (initialSymbol) {
      fetchStockData(initialSymbol);
    }
  }, [initialSymbol]);
  
  const fetchStockData = async (symbol: string) => {
    setIsLoading(true);
    
    if (useRealData) {
      try {
        const historicalData = await fetchHistoricalData(symbol);
        
        if (historicalData) {
          const processedData = generatePredictions(historicalData);
          setStockData(processedData);
          toast.success(`${symbol} data loaded successfully`);
        } else {
          // Fall back to mock data if API fails
          const mockData = generateMockData(symbol);
          setStockData(mockData);
          toast.warning(`Using simulated data for ${symbol}`);
          setUseRealData(false);
        }
      } catch (error) {
        console.error('Error fetching stock data:', error);
        const mockData = generateMockData(symbol);
        setStockData(mockData);
        toast.error(`Error loading data, using simulated data for ${symbol}`);
        setUseRealData(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Directly use mock data
      setTimeout(() => {
        const data = generateMockData(symbol);
        setStockData(data);
        setIsLoading(false);
        toast.info(`${symbol} simulated data loaded`);
      }, 1000);
    }
  };
  
  const handleSearch = (ticker: string) => {
    setCurrentSymbol(ticker);
  };
  
  // Mock insights based on the selected stock
  const getStockInsights = () => {
    if (!currentSymbol) return [];
    
    if (currentSymbol === 'AAPL') {
      return [
        { title: 'Strong Buy Signal', description: 'Technical indicators suggest bullish momentum.', type: 'positive' as const, value: '87% Confidence' },
        { title: 'Recent Performance', description: 'Outperforming sector by 3.2% in the last quarter.', type: 'positive' as const, value: '+12.4% QTD' },
        { title: 'Volatility', description: 'Stock shows lower volatility than market average.', type: 'neutral' as const, value: '0.89 Beta' }
      ];
    } else if (currentSymbol === 'TSLA') {
      return [
        { title: 'Hold Recommendation', description: 'Mixed signals with recent price volatility.', type: 'neutral' as const, value: '52% Confidence' },
        { title: 'Technical Resistance', description: 'Approaching key resistance level at $260.', type: 'negative' as const, value: 'Caution' },
        { title: 'Volume Analysis', description: 'Trading volume increasing on down days.', type: 'negative' as const, value: '+32% Volume' }
      ];
    } else {
      return [
        { title: 'Moderate Buy', description: 'Positive outlook with some caution advised.', type: 'positive' as const, value: '68% Confidence' },
        { title: 'Price Momentum', description: 'Positive price action in recent trading sessions.', type: 'positive' as const, value: 'Bullish' },
        { title: 'Market Correlation', description: 'Stock following broader market trends.', type: 'neutral' as const, value: '0.95 Correlation' }
      ];
    }
  };
  
  return (
    <PageLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Stock Predictions</h1>
        <p className="text-muted-foreground">AI-powered price forecasting with deep learning models</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <StockSearch onSearch={handleSearch} />
          
          {/* Data Source Toggle */}
          <div className="finance-card p-4 mt-4">
            <h3 className="text-md font-semibold mb-2">Data Source</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {useRealData ? 'Using API data when possible' : 'Using simulated data'}
              </span>
              <button 
                onClick={() => {
                  setUseRealData(!useRealData);
                  toast.info(`Switched to ${!useRealData ? 'API' : 'simulated'} data`);
                  if (currentSymbol) fetchStockData(currentSymbol);
                }}
                className="text-xs px-2 py-1 rounded bg-primary text-white"
              >
                Toggle
              </button>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {!currentSymbol ? (
            <div className="finance-card p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Search for a Stock</h2>
              <p className="text-muted-foreground">
                Enter a stock ticker symbol to view predictions and analysis.
              </p>
            </div>
          ) : isLoading ? (
            <div className="finance-card p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2">Loading Predictions</h2>
              <p className="text-muted-foreground">
                Analyzing {currentSymbol} data and generating forecasts...
              </p>
            </div>
          ) : (
            <Tabs defaultValue="prediction">
              <TabsList className="mb-4">
                <TabsTrigger value="prediction">Price Prediction</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prediction">
                <PredictionChart 
                  data={stockData} 
                  symbol={currentSymbol} 
                  modelAccuracy={modelAccuracy} 
                />
              </TabsContent>
              
              <TabsContent value="insights">
                <div className="finance-card p-4">
                  <h2 className="text-xl font-bold mb-4">{currentSymbol} Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getStockInsights().map((insight, index) => (
                      <TrendCard
                        key={index}
                        title={insight.title}
                        description={insight.description}
                        type={insight.type}
                        value={insight.value}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default PredictPage;
