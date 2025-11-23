import { useState } from "react";
import { MarketTabs } from "@/components/MarketTabs";
import { ChatInterface } from "@/components/ChatInterface";
import { StrategyRules } from "@/components/StrategyRules";
import { useStrategyCycle } from "@/hooks/useStrategyCycle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Play } from "lucide-react";

const Index = () => {
  const [selectedMarket, setSelectedMarket] = useState("crypto");
  const { strategy, status, lastAnalysis, nextAnalysis, logs, isRunning, toggleCycle, isConnected } = useStrategyCycle();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm sticky top-0 z-50">
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
            <div className="flex items-center gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 bg-card/50 px-3 py-1.5 rounded-lg border border-border/50">
                {status === 'idle' ? (
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ) : (
                  <Loader2 className="w-3 h-3 text-neon-cyan animate-spin" />
                )}
                <span className="text-xs font-mono text-muted-foreground">
                  {status === 'idle' 
                    ? `Next Analysis: ${nextAnalysis?.toLocaleTimeString()}` 
                    : status.toUpperCase()}
                </span>
              </div>
              
              <Button 
                variant="outline" 
                onClick={toggleCycle}
                className={`${
                  isRunning 
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-500 border-red-500/50" 
                    : "bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border-neon-cyan/50"
                } border shadow-lg transition-all`}
              >
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? "Stop Cycle" : "Start Auto-Cycle"}
              </Button>

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
        </div>
      </header>

      {/* Market Tabs */}
      <MarketTabs value={selectedMarket} onValueChange={setSelectedMarket} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Chat & Logs */}
          <div className="lg:col-span-1 space-y-6">
            <div className="h-[500px]">
              <ChatInterface strategy={strategy} />
            </div>
            
            {/* System Logs */}
            <div className="bg-card/30 border border-border/50 rounded-lg p-4 h-[200px] overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> System Logs
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px]">
                {logs.map((log, i) => (
                  <div key={i} className="text-muted-foreground border-l-2 border-border pl-2 py-0.5">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Strategy Rules */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Active Strategy: {strategy.name}</h2>
              <Badge variant="outline" className="font-mono text-xs">
                ID: {strategy.strategy_id}
              </Badge>
            </div>
            <StrategyRules strategy={strategy} />
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
