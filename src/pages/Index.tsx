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
                <span className="text-neon-purple">CryptoVault</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Market Tabs */}
      <MarketTabs value={selectedMarket} onValueChange={setSelectedMarket} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Centered Chat Interface */}
        <div className="mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="h-[600px] shadow-2xl">
              <ChatInterface strategy={strategy} market={selectedMarket} />
            </div>
          </div>
        </div>

        {/* Active Strategy & System Logs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Strategy Info */}
          <div className="lg:col-span-2 bg-card/30 border border-border/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-foreground">Active Strategy: {strategy.name}</h3>
              <Badge variant="outline" className="font-mono text-xs">
                ID: {strategy.strategy_id}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1">Max Position</p>
                  <p className="font-mono text-neon-cyan">{(strategy.risk_profile.max_position_pct * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1">Stop Loss</p>
                  <p className="font-mono text-red-500">{(strategy.risk_profile.stop_loss_pct * 100).toFixed(0)}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground/70 mb-1">Take Profit</p>
                  <p className="font-mono text-green-500">{(strategy.risk_profile.take_profit_pct * 100).toFixed(0)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Logs */}
          <div className="bg-card/30 border border-border/50 rounded-lg p-4 max-h-[200px] overflow-hidden flex flex-col">
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

        {/* Strategy Rules Section */}
        <div className="bg-card/20 border border-border/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-neon-cyan to-neon-purple rounded-full"></div>
            Strategy Configuration
          </h2>
          <StrategyRules strategy={strategy} />
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
