
import { POLYGON_API_KEY } from '@/config/stocks';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  data: number[];
}

export const fetchStockQuotes = async (symbols: string[]): Promise<StockQuote[]> => {
  const quotes: StockQuote[] = [];
  
  // Fetch current price and daily change
  const currentDate = new Date().toISOString().split('T')[0];
  
  try {
    const responses = await Promise.all(
      symbols.map(symbol =>
        fetch(`https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${currentDate}/${currentDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`)
          .then(res => res.json())
      )
    );

    // Fetch historical data for sparkline
    const historicalResponses = await Promise.all(
      symbols.map(symbol => {
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 7);
        return fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate.toISOString().split('T')[0]}/${currentDate}?adjusted=true&apiKey=${POLYGON_API_KEY}`
        ).then(res => res.json());
      })
    );

    responses.forEach((response, index) => {
      const symbol = symbols[index];
      const historicalData = historicalResponses[index];
      
      if (response.results && response.results[0] && historicalData.results) {
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
    return [];
  }
};
