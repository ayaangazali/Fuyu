import { useState } from "react";
import { MarketTabs } from "@/components/MarketTabs";
import { ChatInterface } from "@/components/ChatInterface";
import { StrategyRules } from "@/components/StrategyRules";

const Index = () => {
  const [selectedMarket, setSelectedMarket] = useState("crypto");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                <span className="text-neon-cyan">Quantum</span>
                <span className="text-neon-purple">Trade</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-Powered Strategy Customization
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/50">
                <span className="text-xs font-mono text-primary">BTC/USD</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/50">
                <span className="text-xs font-mono text-secondary">$43,521.00</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Market Tabs */}
      <MarketTabs value={selectedMarket} onValueChange={setSelectedMarket} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Chat Interface */}
          <div className="h-[500px]">
            <ChatInterface />
          </div>

          {/* Strategy Rules */}
          <div>
            <StrategyRules />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-4">
          <p className="text-xs text-muted-foreground text-center">
            Powered by AI • Real-time Market Data • Backtesting Engine
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
