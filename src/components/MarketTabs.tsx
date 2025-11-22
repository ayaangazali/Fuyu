import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Bitcoin, ChartCandlestick, DollarSign } from "lucide-react";

const markets = [
  { id: "stock", label: "Stock", icon: TrendingUp },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "future", label: "Future", icon: ChartCandlestick },
  { id: "forex", label: "Forex", icon: DollarSign },
];

interface MarketTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const MarketTabs = ({ value, onValueChange }: MarketTabsProps) => {
  return (
    <div className="w-full border-b border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <Tabs value={value} onValueChange={onValueChange} className="w-full">
          <TabsList className="w-full h-16 bg-transparent border-0 rounded-none justify-start gap-2 px-0">
          {markets.map((market) => {
            const Icon = market.icon;
            const isActive = value === market.id;
            return (
              <TabsTrigger
                key={market.id}
                value={market.id}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  transition-all duration-300 border border-transparent
                  data-[state=active]:border-primary data-[state=active]:bg-primary/10
                  data-[state=active]:text-primary data-[state=active]:shadow-[0_0_15px_rgba(0,217,255,0.3)]
                  hover:bg-muted/50
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-semibold tracking-wide">{market.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        </Tabs>
      </div>
    </div>
  );
};
