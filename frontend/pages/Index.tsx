import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, MoreVertical } from "lucide-react";

// Interfaces for API data
interface Position {
    symbol: string;
    quantity: number;
    value: number;
}

interface PortfolioData {
    total_value: number;
    total_change_24h: number;
    positions: Position[];
    last_updated: string;
}

interface CryptoPrice {
    name: string;
    price: number;
    percent_change_24h: number;
    market_cap: number;
    volume_24h: number;
}

const Index = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("positions");
    const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
    const [marketPrices, setMarketPrices] = useState<Record<string, CryptoPrice>>({});
    const [selectedPeriod, setSelectedPeriod] = useState("1Y");
    const [chartData, setChartData] = useState<any[]>([]);
    const [riskAnalysis, setRiskAnalysis] = useState<string>("Loading risk analysis...");
    const [riskAnalysisTime, setRiskAnalysisTime] = useState<string>("");

    // Order history data matching screenshot
    const orderHistory = [
        { symbol: 'NASDAQ:NVDA', icon: '🟢', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '139.55', status: 'Filled', statusColor: 'text-green-400', time: '2024-12-10 06:35:23' },
        { symbol: 'NASDAQ:AMZN', icon: '🟠', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-08-06 14:20:24' },
        { symbol: 'NASDAQ:NVDA', icon: '🟢', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-08-02 14:06:45' },
        { symbol: 'NASDAQ:NVDA', icon: '🟢', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-07-30 02:53:46' },
        { symbol: 'NASDAQ:NVDA', icon: '🟢', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-07-05 00:59:14' },
        { symbol: 'NYSE:BRK.B', icon: '🅱️', side: 'Sell', type: 'Market', qty: 1, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-07-05 00:59:08' },
        { symbol: 'NASDAQ:NVDA', icon: '🟢', side: 'Sell', type: 'Market', qty: 5, limitPrice: '', stopPrice: '', fillPrice: '', status: 'Rejected', statusColor: 'text-red-400', time: '2024-06-29 00:58:37' },
        { symbol: 'NASDAQ:AMZN', icon: '🟠', side: 'Buy', type: 'Limit', qty: 4, limitPrice: '184.68', stopPrice: '', fillPrice: '184.68', status: 'Filled', statusColor: 'text-green-400', time: '2024-05-17 11:55:25' },
        { symbol: 'NASDAQ:AMZN', icon: '🟠', side: 'Buy', type: 'Limit', qty: 1, limitPrice: '184.43', stopPrice: '', fillPrice: '184.41', status: 'Filled', statusColor: 'text-green-400', time: '2024-05-17 11:53:38' },
        { symbol: 'AMEX:IVV', icon: 'ℹ️', side: 'Buy', type: 'Stop', qty: 1, limitPrice: '', stopPrice: '530.99', fillPrice: '531.08', status: 'Filled', statusColor: 'text-green-400', time: '2024-05-17 11:52:16' },
    ];

    const fetchHistory = async (period: string) => {
        try {
            const res = await fetch(`http://localhost:8000/portfolio/history?period=${period}`);
            if (res.ok) {
                const data = await res.json();
                setChartData(data);
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    const fetchRiskAnalysis = async () => {
        try {
            const res = await fetch("http://localhost:8000/portfolio/risk-analysis");
            if (res.ok) {
                const data = await res.json();
                setRiskAnalysis(data.analysis);
                setRiskAnalysisTime(data.timestamp);
            } else {
                setRiskAnalysis("Risk analysis unavailable.");
            }
        } catch (error) {
            console.error("Error fetching risk analysis:", error);
            setRiskAnalysis("Failed to load risk analysis.");
        }
    };

    // TODO: Implement order history fetching
    // const fetchOrderHistory = async () => {
    //     try {
    //         const res = await fetch("http://localhost:8000/portfolio/orders");
    //         if (res.ok) {
    //             const data = await res.json();
    //             setOrderHistory(data.orders || []);
    //         }
    //     } catch (error) {
    //         console.error("Error fetching order history:", error);
    //     }
    // };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch Portfolio Value
            const portfolioRes = await fetch("http://localhost:8000/portfolio/value");
            if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio");
            const portfolio: PortfolioData = await portfolioRes.json();
            setPortfolioData(portfolio);

            // 2. Fetch Real-time Prices for positions
            const symbols = portfolio.positions.map(p => p.symbol).join(',');
            if (symbols) {
                const pricesRes = await fetch(`http://localhost:8000/crypto/prices?symbols=${symbols}`);
                if (pricesRes.ok) {
                    const pricesData = await pricesRes.json();
                    if (pricesData.success && pricesData.data) {
                        setMarketPrices(pricesData.data);
                    }
                }
            }
            
            // 3. Fetch History
            await fetchHistory(selectedPeriod);

            // 4. Fetch Risk Analysis (non-blocking)
            fetchRiskAnalysis();

            // 5. Fetch Order History
            // fetchOrderHistory();

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchHistory(selectedPeriod);
    }, [selectedPeriod]);

    return (
        <div className="min-h-screen bg-white">
            {/* Account Stats Bar - Black */}
            <div className="bg-[#0a0a0a] text-white px-6 py-5 border-b border-gray-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Account Balance</p>
                        <p className="font-semibold text-base">
                            {portfolioData ? `$${portfolioData.total_value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "---"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Equity</p>
                        <p className="font-semibold text-base">
                            {portfolioData ? `$${portfolioData.total_value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "---"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Realized P&L</p>
                        <p className="font-semibold text-base text-green-400">+26,093.15</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Unrealized P&L</p>
                        <p className="font-semibold text-base text-green-400">
                             {portfolioData ? `+$${(portfolioData.total_value * (portfolioData.total_change_24h / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "---"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Account margin</p>
                        <p className="font-semibold text-base">30.64</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Available funds</p>
                        <p className="font-semibold text-base">
                            {portfolioData ? `$${(portfolioData.total_value * 0.9).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "---"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Orders margin</p>
                        <p className="font-semibold text-base">0.00</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6">
                {/* Brokerage Account Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900">Brokerage Account</h1>
                    <Button variant="ghost" size="icon" onClick={fetchData} disabled={isLoading} className="hover:bg-gray-100">
                        <RefreshCw className={`h-5 w-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Portfolio Value & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                                    {portfolioData ? `$${portfolioData.total_value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "$---"}
                                </h2>
                                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap ${portfolioData && portfolioData.total_change_24h >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {portfolioData && portfolioData.total_change_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {portfolioData ? `${Math.abs(portfolioData.total_change_24h)}%` : "--%"}
                                </span>
                                <span className="text-green-600 text-base lg:text-lg font-medium whitespace-nowrap">+34,085.34 1Y</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {portfolioData 
                                    ? new Date(portfolioData.last_updated).toLocaleString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: 'numeric', 
                                        minute: '2-digit', 
                                        second: '2-digit',
                                        hour12: true,
                                        timeZoneName: 'short'
                                    })
                                    : "Loading..."
                                } · USD · Disclaimer
                            </p>
                        </div>

                        {/* Period Selector */}
                        <div className="flex items-center gap-4 lg:gap-6 overflow-x-auto pb-2">
                            {['1M', '6M', 'YTD', '1Y', '5Y', 'MAX'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setSelectedPeriod(period)}
                                    className={`text-sm font-medium pb-2 whitespace-nowrap transition-colors ${selectedPeriod === period
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>

                        {/* Chart */}
                        <div className="w-full">
                            <ResponsiveContainer width="100%" height={320}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#999" 
                                        style={{ fontSize: '12px' }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            // Format based on selected period
                                            switch (selectedPeriod) {
                                                case '1M':
                                                    // Show day and month for 1 month
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                case '6M':
                                                case 'YTD':
                                                    // Show month and day for 6 months / YTD
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                case '1Y':
                                                    // Show month and year for 1 year
                                                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                                case '5Y':
                                                case 'MAX':
                                                    // Show month and year for 5 years / MAX
                                                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                                                default:
                                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }
                                        }}
                                        interval="preserveStartEnd"
                                        minTickGap={50}
                                    />
                                    <YAxis 
                                        stroke="#999" 
                                        style={{ fontSize: '12px' }} 
                                        domain={['auto', 'auto']}
                                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => [`$${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, "Value"]}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Portfolio Highlights */}
                    <Card className="border border-gray-200 bg-white shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-900">Portfolio highlights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">DAY GAIN</p>
                                    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm min-h-[100px] flex flex-col justify-center">
                                        <p className="text-2xl font-bold text-red-600 whitespace-nowrap">-$1,573.38</p>
                                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                                            <TrendingDown className="w-4 h-4" />
                                            1.25%
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">TOTAL GAIN</p>
                                    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm min-h-[100px] flex flex-col justify-center">
                                        <p className={`text-2xl font-bold whitespace-nowrap ${portfolioData && portfolioData.total_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {portfolioData ? (portfolioData.total_change_24h >= 0 ? '+' : '-') : ''}
                                            {portfolioData ? `$${Math.abs(portfolioData.total_value * (portfolioData.total_change_24h / 100)).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "---"}
                                        </p>
                                        <p className={`text-sm flex items-center gap-1 mt-2 ${portfolioData && portfolioData.total_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {portfolioData && portfolioData.total_change_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {portfolioData ? `${Math.abs(portfolioData.total_change_24h)}%` : "--%"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">RISK ANALYSIS</p>
                                <div className="border border-gray-300 bg-white p-6 rounded-xl shadow-sm">
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                        {riskAnalysis}
                                    </p>
                                    {riskAnalysisTime && (
                                        <p className="text-xs text-gray-400 mt-2 text-right">
                                            Analysis as of {riskAnalysisTime}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Section */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-[#0a0a0a] w-full justify-start h-12 rounded-none p-0 border-b border-gray-800">
                        <TabsTrigger
                            value="positions"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-white h-full px-6"
                        >
                            Positions <span className="ml-2 text-gray-400">{portfolioData ? portfolioData.positions.length : 0}</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-white h-full px-6"
                        >
                            Order History
                        </TabsTrigger>
                        <TabsTrigger
                            value="strategies"
                            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-white h-full px-6"
                        >
                            Strategies
                        </TabsTrigger>
                    </TabsList>

                    {/* Positions Tab */}
                    <TabsContent value="positions" className="mt-0">
                        <div className="bg-white rounded-b-lg overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Symbol</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Side</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Avg Fill Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Take Profit</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Stop Loss</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Last Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Unrealized P&L</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Unrealized P&L %</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Trade</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {portfolioData?.positions.map((position, idx) => {
                                            const priceData = marketPrices[position.symbol];
                                            const currentPrice = priceData ? priceData.price : 0;
                                            const currentValue = currentPrice * position.quantity;
                                            // Mock entry price as 90% of current price for demo purposes if not available
                                            const entryPrice = currentPrice * 0.9; 
                                            const unrealizedPL = currentValue - (entryPrice * position.quantity);
                                            const plPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
                                            const isProfit = unrealizedPL >= 0;

                                            return (
                                                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
                                                                {position.symbol.substring(0, 2)}
                                                            </div>
                                                            <span className="font-medium text-gray-900">{position.symbol}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-blue-600 font-medium">Long</td>
                                                    <td className="px-4 py-3 text-gray-900">{position.quantity}</td>
                                                    <td className="px-4 py-3 text-gray-900">${entryPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                    <td className="px-4 py-3 text-gray-400">-</td>
                                                    <td className="px-4 py-3 text-gray-400">-</td>
                                                    <td className="px-4 py-3 text-gray-900 font-medium">
                                                        {currentPrice ? `$${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "Loading..."}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`${isProfit ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                                            {isProfit ? '+' : ''}{unrealizedPL.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                        </span>
                                                        <span className="text-gray-400 text-xs ml-1">USD</span>
                                                    </td>
                                                    <td className={`px-4 py-3 ${isProfit ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                                        {isProfit ? '+' : ''}{plPercent.toFixed(2)}%
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500">
                                                        {currentValue.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 text-gray-400">
                                                            <button className="hover:text-gray-600">✏️</button>
                                                            <button className="hover:text-gray-600">✕</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Order History Tab */}
                    <TabsContent value="history" className="mt-0">
                        <div className="bg-white rounded-b-lg overflow-hidden border border-gray-200">
                            <div className="flex gap-6 p-4 border-b border-gray-200 text-sm bg-gray-50">
                                <button className="text-gray-900 font-semibold border-b-2 border-blue-600 pb-1">All 22</button>
                                <button className="text-gray-500 hover:text-gray-700">Filled <span className="text-gray-400">14</span></button>
                                <button className="text-gray-500 hover:text-gray-700">Cancelled <span className="text-gray-400">2</span></button>
                                <button className="text-gray-500 hover:text-gray-700">Rejected <span className="text-gray-400">6</span></button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Symbol</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Side</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Limit Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Stop Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Fill Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Commission</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Placing Time</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderHistory.map((order, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-600">
                                                            {order.symbol.split(':')[0].substring(0, 2)}
                                                        </div>
                                                        <span className={`px-3 py-1.5 rounded-md font-medium ${order.symbol.includes('NVDA') && idx === 2 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                                            {order.symbol}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-3 font-medium ${order.side === 'Buy' ? 'text-blue-600' : 'text-red-600'}`}>
                                                    {order.side}
                                                </td>
                                                <td className="px-4 py-3 text-gray-900">{order.type}</td>
                                                <td className="px-4 py-3 text-gray-900">{order.qty}</td>
                                                <td className="px-4 py-3 text-gray-900">{order.limitPrice || '-'}</td>
                                                <td className="px-4 py-3 text-gray-900">{order.stopPrice || '-'}</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">{order.fillPrice || '-'}</td>
                                                <td className={`px-4 py-3 font-semibold ${order.status === 'Filled' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {order.status}
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">-</td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{order.time}</td>
                                                <td className="px-4 py-3">
                                                    {order.status === 'Rejected' && (
                                                        <span className="text-red-500 text-lg">⚠️</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Strategies Tab */}
                    <TabsContent value="strategies" className="mt-0">
                        <div className="bg-white rounded-b-lg overflow-hidden border border-gray-200 p-8">
                            <div className="max-w-6xl mx-auto">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-semibold text-gray-900">Trading Strategies</h3>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                    {/* Strategy Card 1 - Momentum Surge Hunter */}
                                    <Card className="border-2 border-green-200 bg-green-50/30 hover:shadow-lg transition-all">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-xl font-bold text-gray-900">Momentum Surge Hunter</h4>
                                                            <span className="px-2.5 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">ACTIVE</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">Captures explosive momentum breakouts with adaptive volatility filters</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>👤</span> Alex Chen
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        Identifies explosive momentum breakouts using RSI divergence, MACD crossovers, and volume surge analysis. 
                                                        The strategy employs adaptive volatility filters to avoid false breakouts and optimize entry timing during 
                                                        high-momentum market conditions.
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                                                        <p className="text-lg font-bold text-green-600">67.3%</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Avg Return</p>
                                                        <p className="text-lg font-bold text-green-600">+3.2%</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm pt-2">
                                                    <div>
                                                        <span className="text-gray-500">CAGR</span>
                                                        <span className="ml-2 text-green-600 font-bold">18.0%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Sharpe</span>
                                                        <span className="ml-2 text-blue-600 font-bold">2.10</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">DD</span>
                                                        <span className="ml-2 text-red-600 font-bold">5.0%</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button variant="outline" className="w-full border-gray-300">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Strategy Card 2 - Volatility Compression Play */}
                                    <Card className="border-2 border-gray-300 bg-gray-50/30 hover:shadow-lg transition-all">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-xl font-bold text-gray-900">Volatility Compression Play</h4>
                                                            <span className="px-2.5 py-0.5 bg-gray-400 text-white rounded-full text-xs font-bold">INACTIVE</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">Exploits low volatility squeeze patterns followed by explosive moves</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>👤</span> Sarah Martinez
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        Exploits Bollinger Band squeeze patterns where volatility contracts before explosive price movements. 
                                                        Uses machine learning to detect low volatility zones and predict directional breakouts with high probability. 
                                                        Ideal for range-bound markets transitioning to trending phases.
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                                                        <p className="text-lg font-bold text-green-600">71.8%</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Avg Return</p>
                                                        <p className="text-lg font-bold text-green-600">+5.1%</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm pt-2">
                                                    <div>
                                                        <span className="text-gray-500">CAGR</span>
                                                        <span className="ml-2 text-green-600 font-bold">11.0%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Sharpe</span>
                                                        <span className="ml-2 text-blue-600 font-bold">1.50</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">DD</span>
                                                        <span className="ml-2 text-red-600 font-bold">6.0%</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button variant="outline" className="w-full border-gray-300">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Strategy Card 3 - Swing Scalper Pro */}
                                    <Card className="border-2 border-gray-300 bg-gray-50/30 hover:shadow-lg transition-all">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-xl font-bold text-gray-900">Swing Scalper Pro</h4>
                                                            <span className="px-2.5 py-0.5 bg-gray-400 text-white rounded-full text-xs font-bold">INACTIVE</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">High-frequency swing trades on intraday momentum with tight stops</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>👤</span> Emma Rodriguez
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        High-frequency scalping strategy that capitalizes on intraday swing patterns with precise entry and exit points. 
                                                        Utilizes tight stop-losses and quick profit-taking to accumulate gains throughout the trading session. 
                                                        Best suited for liquid stocks with consistent intraday volatility.
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                                                        <p className="text-lg font-bold text-green-600">64.2%</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Avg Return</p>
                                                        <p className="text-lg font-bold text-green-600">+4.8%</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm pt-2">
                                                    <div>
                                                        <span className="text-gray-500">CAGR</span>
                                                        <span className="ml-2 text-green-600 font-bold">16.0%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Sharpe</span>
                                                        <span className="ml-2 text-blue-600 font-bold">1.80</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">DD</span>
                                                        <span className="ml-2 text-red-600 font-bold">4.0%</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button variant="outline" className="w-full border-gray-300">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Strategy Card 4 - Trend Following Beast */}
                                    <Card className="border-2 border-orange-200 bg-orange-50/30 hover:shadow-lg transition-all">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="text-xl font-bold text-gray-900">Trend Following Beast</h4>
                                                            <span className="px-2.5 py-0.5 bg-gray-400 text-white rounded-full text-xs font-bold">PAUSED</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">Multi-timeframe trend confirmation with momentum surge detection</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <span>👤</span> David Park
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        Multi-timeframe trend confirmation strategy that rides strong directional moves across daily, weekly, and monthly charts. 
                                                        Combines moving average convergence with momentum surge detection to identify high-conviction trend entries. 
                                                        Designed for capturing large market moves with optimal risk-reward ratios.
                                                    </p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Win Rate</p>
                                                        <p className="text-lg font-bold text-green-600">69.5%</p>
                                                    </div>
                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                        <p className="text-xs text-gray-500 mb-1">Avg Return</p>
                                                        <p className="text-lg font-bold text-green-600">+6.3%</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm pt-2">
                                                    <div>
                                                        <span className="text-gray-500">CAGR</span>
                                                        <span className="ml-2 text-green-600 font-bold">25.0%</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Sharpe</span>
                                                        <span className="ml-2 text-blue-600 font-bold">1.90</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">DD</span>
                                                        <span className="ml-2 text-red-600 font-bold">8.0%</span>
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <Button variant="outline" className="w-full border-gray-300">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Strategy Performance Summary */}
                                <Card className="border border-gray-200 bg-gradient-to-br from-gray-50 to-white">
                                    <CardContent className="p-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Total Strategies</p>
                                                <p className="text-3xl font-bold text-gray-900">4</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Active Strategies</p>
                                                <p className="text-3xl font-bold text-green-600">1</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Total Trades</p>
                                                <p className="text-3xl font-bold text-gray-900">116</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Avg Win Rate</p>
                                                <p className="text-3xl font-bold text-green-600">69.2%</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Index;