import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

interface Rule {
  id: string;
  label: string;
  type: "entry" | "exit" | "risk";
  description: string;
  active: boolean;
}

const mockRules: Rule[] = [
  {
    id: "A",
    label: "Entry Rule A",
    type: "entry",
    description: "Buy when price breaks above upper Dual Thrust band",
    active: true,
  },
  {
    id: "B",
    label: "Position Sizing B",
    type: "risk",
    description: "Allocate 5% of portfolio per trade with 2x leverage",
    active: true,
  },
  {
    id: "C",
    label: "Stop Loss C",
    type: "exit",
    description: "Exit if price drops 3% below entry point",
    active: true,
  },
  {
    id: "D",
    label: "Take Profit D",
    type: "entry",
    description: "Close position at 8% profit target",
    active: false,
  },
];

const getRuleColor = (type: Rule["type"]) => {
  switch (type) {
    case "entry":
      return "text-neon-cyan border-neon-cyan/50 bg-neon-cyan/10";
    case "exit":
      return "text-destructive border-destructive/50 bg-destructive/10";
    case "risk":
      return "text-neon-purple border-neon-purple/50 bg-neon-purple/10";
  }
};

const getRuleIcon = (type: Rule["type"]) => {
  switch (type) {
    case "entry":
      return TrendingUp;
    case "exit":
      return AlertCircle;
    case "risk":
      return CheckCircle2;
  }
};

export const StrategyRules = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Strategy Rules & Indicators</h3>
        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
          {mockRules.filter(r => r.active).length} Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mockRules.map((rule) => {
          const Icon = getRuleIcon(rule.type);
          return (
            <Card
              key={rule.id}
              className={`
                p-4 border transition-all duration-300 cursor-pointer
                ${
                  rule.active
                    ? "border-primary/50 bg-card/50 hover:border-primary hover:shadow-[0_0_15px_rgba(0,217,255,0.2)]"
                    : "border-border/30 bg-card/20 opacity-60 hover:opacity-80"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${getRuleColor(rule.type)}
                  `}
                >
                  <span className="text-lg font-bold font-mono">{rule.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {rule.label}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {rule.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getRuleColor(rule.type)}`}
                    >
                      {rule.type}
                    </Badge>
                    {rule.active && (
                      <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
