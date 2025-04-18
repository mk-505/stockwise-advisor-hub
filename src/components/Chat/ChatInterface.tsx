
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "👋 Hello! I'm your financial advisor. Ask me anything about stocks, market trends, or investment strategies.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate API call - in real app, this would call your GPT-powered backend
    setTimeout(() => {
      // Mock responses based on user input
      let responseContent = '';
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes('aapl') || lowerInput.includes('apple')) {
        responseContent = "Based on recent data, Apple (AAPL) has shown strong performance with positive analyst ratings. Their latest product launches and services growth are contributing to a bullish outlook. Consider monitoring their upcoming earnings report for further guidance.";
      } else if (lowerInput.includes('tsla') || lowerInput.includes('tesla')) {
        responseContent = "Tesla (TSLA) has been experiencing volatility due to production challenges and increased competition. However, their innovation in EV technology and energy solutions positions them well for long-term growth. Risk-tolerant investors might see current prices as an opportunity.";
      } else if (lowerInput.includes('msft') || lowerInput.includes('microsoft')) {
        responseContent = "Microsoft (MSFT) continues to show strong growth driven by cloud services and AI investments. Their diversified revenue streams and strategic acquisitions create a stable outlook. Many analysts maintain buy ratings with expectations of continued steady growth.";
      } else if (lowerInput.includes('market') || lowerInput.includes('trend')) {
        responseContent = "Current market trends indicate cautious optimism amid inflation concerns and interest rate adjustments. Technology and healthcare sectors are showing resilience, while consumer discretionary faces challenges. Consider diversification and maintaining cash reserves for potential opportunities.";
      } else {
        responseContent = "Thank you for your question. While I don't have specific data on that particular query, I recommend considering factors like company fundamentals, industry trends, and macroeconomic conditions in your investment decisions. Would you like me to provide general guidance on investment strategies instead?";
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: "Chat cleared. How can I help you with your financial questions today?",
        isUser: false,
        timestamp: new Date()
      }
    ]);
    toast.success("Chat history cleared");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="finance-card flex flex-col h-[calc(100vh-13rem)]">
      <div className="flex justify-between items-center p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Financial Advisor</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat}>
          <RefreshCcw className="h-4 w-4 mr-1" />
          Clear Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`flex max-w-[80%] md:max-w-[70%] ${
                message.isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div 
                className={`flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 ${
                  message.isUser ? 'ml-2 bg-primary/20' : 'mr-2 bg-muted'
                }`}
              >
                {message.isUser ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Bot className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              
              <div 
                className={`px-4 py-2 rounded-lg ${
                  message.isUser 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0 mr-2 bg-muted">
                <Bot className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="px-4 py-3 rounded-lg bg-muted">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: '600ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <Separator />
      
      <div className="p-3 flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about stocks, market trends, or investment advice..."
          className="resize-none"
          rows={2}
          disabled={isLoading}
        />
        <Button 
          className="h-10 px-4" 
          disabled={!input.trim() || isLoading} 
          onClick={handleSendMessage}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
