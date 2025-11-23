import { useState, useEffect, useRef } from 'react';
import { mockDeck } from '../data/mockDeck';

interface Strategy {
    strategy_id: string;
    name: string;
    description?: string;
    risk_profile: {
        max_position_pct: number;
        stop_loss_pct: number;
        take_profit_pct: number;
    };
    logic: any[]; // Using any[] to handle varying logic structures between strategies
}

// Initial strategy from strategy.json
const initialStrategy: Strategy = {
    strategy_id: "rsi_meanrev_v1",
    name: "RSI Mean Reversion",
    risk_profile: {
        max_position_pct: 0.2,
        stop_loss_pct: 0.03,
        take_profit_pct: 0.06
    },
    logic: [
        {
            indicator: "RSI",
            params: { period: 14 },
            buy: { threshold: [10, 25], operator: "between" },
            sell: { threshold: [75, 100], operator: "between" }
        },
        {
            indicator: "EMA",
            params: { fast: 9, slow: 21 },
            buy: { condition: "fast_crosses_above_slow" },
            sell: { condition: "fast_crosses_below_slow" }
        }
    ]
};

export const useStrategyCycle = () => {
    const [strategy, setStrategy] = useState<Strategy>(initialStrategy);
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'modifying' | 'replacing'>('idle');
    const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
    const [nextAnalysis, setNextAnalysis] = useState<Date | null>(null);
    const [modificationCount, setModificationCount] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const [isRunning, setIsRunning] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [new Date().toLocaleTimeString() + ': ' + msg, ...prev].slice(0, 50));

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            // Run immediately on start if not already running (handled by toggle)
            // Set interval for subsequent runs
            interval = setInterval(() => {
                checkPerformance();
            }, 5 * 60 * 1000); // 5 minutes
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const toggleCycle = () => {
        if (isRunning) {
            setIsRunning(false);
            addLog('Analysis cycle stopped by user.');
            setNextAnalysis(null);
        } else {
            setIsRunning(true);
            setNextAnalysis(new Date(Date.now() + 5 * 60 * 1000));
            addLog('Analysis cycle started. First analysis in 5 minutes.');
        }
    };

    const checkPerformance = async () => {
        setStatus('analyzing');
        addLog('Starting performance analysis (Backend)...');

        try {
            // In a real app, we'd fetch the latest performance data from an API or file
            // For now, we'll construct a mock performance object to send to the backend
            const mockPerformance = {
                timestamp: new Date().toISOString(),
                market: "BTC-USD",
                strategy_id: strategy.strategy_id,
                signal: "BUY",
                price: 43500.0,
                qty: 0.1,
                position_after: 0.1,
                pnl_realized: 0,
                pnl_unrealized: Math.random() * 10 - 3 // Random PnL
            };

            const response = await fetch('http://localhost:8000/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    strategy: strategy,
                    performance: mockPerformance
                }),
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }

            const result = await response.json();
            addLog(`Analysis complete. Decision: ${result.action.toUpperCase()}`);

            if (result.action === 'keep') {
                setStatus('idle');
                addLog(result.feedback);
            } else if (result.action === 'modify') {
                setStatus('modifying');
                addLog(result.feedback);
                if (result.new_strategy) {
                    setStrategy(result.new_strategy);
                    setModificationCount(prev => prev + 1);
                    addLog('Strategy modified based on AI feedback.');
                }
                setStatus('idle');
            } else if (result.action === 'replace') {
                setStatus('replacing');
                addLog(result.feedback);
                if (result.new_strategy) {
                    setStrategy(result.new_strategy);
                    setModificationCount(0);
                    addLog(`Strategy replaced with: ${result.new_strategy.name}`);
                }
                setStatus('idle');
            }

        } catch (error) {
            console.error("Analysis failed:", error);
            addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setStatus('idle');
        }

        setLastAnalysis(new Date());
        setNextAnalysis(new Date(Date.now() + 5 * 60 * 1000));
    };

    // These are now handled by the backend, but we keep empty functions if needed or remove them
    const modifyStrategy = async () => { };
    const replaceStrategy = async () => { };

    return {
        strategy,
        status,
        lastAnalysis,
        nextAnalysis,
        logs,
        isRunning,
        toggleCycle
    };
};
