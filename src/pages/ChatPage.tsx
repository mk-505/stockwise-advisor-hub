
import React from 'react';
import PageLayout from '@/components/Layout/PageLayout';
import ChatInterface from '@/components/Chat/ChatInterface';
import { MessageSquareText, Bot, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ChatPage = () => {
  const recommendedPrompts = [
    "What's the outlook for tech stocks this quarter?",
    "Explain recent market volatility and how to adjust my portfolio",
    "Compare AAPL and MSFT as long-term investments",
    "What sectors should I consider for dividend income?",
    "How will interest rates affect growth stocks this year?"
  ];
  
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Financial Advisor
              </CardTitle>
              <CardDescription>
                AI-powered financial guidance and market insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="mb-3">
                  Ask about specific stocks, market trends, or investment strategies to get personalized insights.
                </p>
                <div className="flex items-center text-muted-foreground border-t pt-3 text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  Responses are generated using AI and should not be considered financial advice.
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Recommended Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recommendedPrompts.map((prompt, index) => (
                  <li key={index} className="text-sm">
                    <button className="text-left text-primary hover:underline">
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <ChatInterface />
        </div>
      </div>
    </PageLayout>
  );
};

export default ChatPage;
