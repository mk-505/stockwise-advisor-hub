
import { POLYGON_API_KEY } from '@/config/stocks';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  data: number[];
}

// Fallback mock data in case the API fails
const mockStockData: Record<string, { price: number; change: number; data: number[] }> = {
  AAPL: { price: 173.58, change: 0.89, data: [170, 168, 166, 169, 170, 173, 174] },
  MSFT: { price: 410.34, change: 1.24, data: [400, 404, 405, 402, 406, 408, 410] },
  AMZN: { price: 179.22, change: -0.47, data: [182, 180, 178, 177, 179, 178, 179] },
  GOOGL: { price: 154.82, change: 0.62, data: [150, 151, 153, 154, 153, 155, 155] },
  GOOG: { price: 156.01, change: 0.58, data: [151, 152, 154, 155, 154, 156, 156] },
  META: { price: 512.28, change: 1.78, data: [500, 505, 507, 510, 508, 510, 512] },
  NVDA: { price: 875.28, change: 2.13, data: [860, 855, 865, 870, 868, 872, 875] },
  TSLA: { price: 172.63, change: -1.25, data: [180, 178, 176, 174, 173, 172, 173] },
  JPM: { price: 182.56, change: 0.45, data: [180, 181, 180, 182, 181, 183, 183] },
  V: { price: 267.35, change: 0.92, data: [260, 262, 265, 264, 266, 267, 267] },
  JNJ: { price: 154.51, change: -0.22, data: [155, 156, 155, 154, 155, 154, 155] },
  UNH: { price: 520.46, change: 1.35, data: [510, 512, 516, 518, 515, 519, 520] },
  MA: { price: 448.79, change: 0.68, data: [440, 442, 445, 446, 447, 449, 449] },
  PG: { price: 165.32, change: 0.14, data: [164, 165, 164, 165, 165, 165, 165] },
  HD: { price: 342.78, change: -0.85, data: [350, 348, 346, 345, 343, 342, 343] },
  DIS: { price: 114.25, change: 1.25, data: [110, 111, 112, 113, 112, 114, 114] },
  NFLX: { price: 613.72, change: 2.34, data: [600, 602, 608, 610, 612, 611, 614] },
  INTC: { price: 30.98, change: -1.45, data: [32, 31.5, 31.2, 31, 30.8, 30.7, 31] },
  AMD: { price: 158.76, change: 1.87, data: [154, 155, 156, 157, 156, 158, 159] },
  ORCL: { price: 122.87, change: 0.52, data: [120, 121, 122, 121, 123, 122, 123] }
};

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const quotes: StockQuote[] = [];
  
  // Fetch current price and daily change
  const currentDate = new Date().toISOString().split('T')[0];
  
  try {
    // We'll fetch data from the API but handle any errors and use mock data as fallback
    const responses = await Promise.all(
      symbols.map(symbol =>
        fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${currentDate}/${currentDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`)
          .then(res => {
            if (!res.ok) {
              console.warn(`Failed to fetch data for ${symbol}: ${res.status}`);
              throw new Error(`API request failed with status ${res.status}`);
            }
            return res.json();
          })
          .catch(error => {
            console.error(`Error fetching ${symbol}:`, error);
            return { fallback: true, symbol };
          })
      )
    );

    // Fetch historical data for sparkline or use mock data
    const historicalResponses = await Promise.all(
      symbols.map(symbol => {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        return fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate.toISOString().split('T')[0]}/${currentDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`
        )
          .then(res => {
            if (!res.ok) {
              console.warn(`Failed to fetch historical data for ${symbol}: ${res.status}`);
              throw new Error(`API request failed with status ${res.status}`);
            }
            return res.json();
          })
          .catch(error => {
            console.error(`Error fetching historical data for ${symbol}:`, error);
            return { fallback: true, symbol };
          });
      })
    );

    responses.forEach((response, index) => {
      const symbol = symbols[index];
      const historicalData = historicalResponses[index];
      
      // Check if we need to use fallback data
      if (response.fallback || historicalData.fallback || 
          !response.results || !response.results[0] || 
          !historicalData.results) {
        
        // Use mock data as fallback
        if (mockStockData[symbol]) {
          quotes.push({
            symbol,
            price: mockStockData[symbol].price,
            change: mockStockData[symbol].change,
            data: mockStockData[symbol].data
          });
        } else {
          // Generate random data if we don't have predefined mock data
          const basePrice = 100 + Math.random() * 900;
          const randomChange = (Math.random() * 4) - 2; // Between -2% and 2%
          const randomData = Array.from({ length: 7 }, () => 
            basePrice + (Math.random() * 10) - 5
          );
          
          quotes.push({
            symbol,
            price: basePrice,
            change: randomChange,
            data: randomData
          });
        }
      } else {
        // Use real API data
        const todayData = response.results[0];
        const sparklineData = historicalData.results.map((result: any) => result.c);
        
        quotes.push({
          symbol,
          price: todayData.c,
          change: ((todayData.c - todayData.o) / todayData.o) * 100,
          data: sparklineData
        });
      }
    });

    return quotes;
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    
    // Return mock data for all requested symbols if the API call completely fails
    return symbols.map(symbol => {
      if (mockStockData[symbol]) {
        return {
          symbol,
          price: mockStockData[symbol].price,
          change: mockStockData[symbol].change,
          data: mockStockData[symbol].data
        };
      } else {
        // Generate random data if we don't have predefined mock data
        const basePrice = 100 + Math.random() * 900;
        const randomChange = (Math.random() * 4) - 2; // Between -2% and 2%
        const randomData = Array.from({ length: 7 }, () => 
          basePrice + (Math.random() * 10) - 5
        );
        
        return {
          symbol,
          price: basePrice,
          change: randomChange,
          data: randomData
        };
      }
    });
  }
};
