import { useState, useEffect, useRef } from 'react';

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
    const [isConnected, setIsConnected] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);

    const addLog = (msg: string) => setLogs(prev => [new Date().toLocaleTimeString() + ': ' + msg, ...prev].slice(0, 50));

    const handleWebSocketMessage = (data: any) => {
        switch (data.type) {
            case 'strategy_update':
                handleStrategyUpdate(data);
                break;
            case 'analysis_status':
                handleAnalysisStatus(data);
                break;
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
    };

    const handleStrategyUpdate = (data: any) => {
        const { action, new_strategy, feedback } = data;

        addLog(`Strategy update received: ${action.toUpperCase()}`);
        addLog(feedback);

        if (action === 'modify' || action === 'replace') {
            if (new_strategy) {
                setStrategy(new_strategy);
                if (action === 'modify') {
                    setModificationCount(prev => prev + 1);
                    addLog(`Strategy modified. Total modifications: ${modificationCount + 1}`);
                } else {
                    setModificationCount(0);
                    addLog(`Strategy replaced with: ${new_strategy.name}`);
                }
            }
        }

        setStatus('idle');
        setLastAnalysis(new Date());
        setNextAnalysis(new Date(Date.now() + 5 * 60 * 1000));
    };

    const handleAnalysisStatus = (data: any) => {
        const { status: newStatus, message } = data;

        if (newStatus === 'analyzing') {
            setStatus('analyzing');
        } else if (newStatus === 'idle') {
            setStatus('idle');
        }

        addLog(message);
    };

    // WebSocket connection management
    useEffect(() => {
        const connectWebSocket = () => {
            try {
                const ws = new WebSocket('ws://localhost:8000/ws');

                ws.onopen = () => {
                    console.log('WebSocket connected');
                    setIsConnected(true);
                    addLog('Connected to backend for real-time updates.');
                };

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        handleWebSocketMessage(data);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };

                ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    setIsConnected(false);
                    addLog('Disconnected from backend.');

                    // Attempt to reconnect after 3 seconds
                    if (isRunning) {
                        setTimeout(connectWebSocket, 3000);
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    addLog('WebSocket connection error.');
                };

                wsRef.current = ws;
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                addLog('Failed to connect to backend.');
            }
        };

        if (isRunning) {
            connectWebSocket();
        } else if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
            setIsConnected(false);
        }

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [isRunning]);

    // Real-time updates now handled exclusively via WebSocket + backend scheduler

    const toggleCycle = async () => {
        if (isRunning) {
            // Stop the cycle
            setIsRunning(false);
            addLog('Analysis cycle stopped by user.');
            setNextAnalysis(null);

            // Stop the backend scheduler
            try {
                const response = await fetch('http://localhost:8000/scheduler/stop', {
                    method: 'POST',
                });

                if (response.ok) {
                    const data = await response.json();
                    addLog('Backend scheduler stopped.');
                    console.log('Scheduler status:', data.status);
                } else {
                    addLog('Warning: Failed to stop backend scheduler.');
                }
            } catch (error) {
                console.error('Error stopping scheduler:', error);
                addLog('Warning: Could not communicate with backend scheduler.');
            }
        } else {
            // Start the cycle
            setIsRunning(true);
            setNextAnalysis(new Date(Date.now() + 5 * 60 * 1000));
            addLog('Analysis cycle started. First analysis in 5 minutes.');

            // Start the backend scheduler
            try {
                const response = await fetch('http://localhost:8000/scheduler/start', {
                    method: 'POST',
                });

                if (response.ok) {
                    const data = await response.json();
                    addLog('Backend scheduler started successfully.');
                    addLog(`Generating performance files every ${data.status.interval_minutes} minutes.`);
                    console.log('Scheduler status:', data.status);
                } else {
                    const errorData = await response.json();
                    addLog(`Backend scheduler error: ${errorData.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error starting scheduler:', error);
                addLog('Warning: Could not start backend scheduler. WebSocket updates only.');
            }
        }
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
        isConnected,
        toggleCycle
    };
};
