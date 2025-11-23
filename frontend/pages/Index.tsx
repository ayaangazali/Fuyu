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
                            <p className="text-sm text-gray-500">Mar 1, 5:54:32 PM UTC-5 · USD · Disclaimer</p>
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
                                            if (selectedPeriod === '1M' || selectedPeriod === '6M') {
                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }
                                            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                                        }}
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
                            <div className="border border-gray-300 bg-white p-6 rounded-xl shadow-sm">
                                <p className="text-sm text-gray-700 text-center font-medium leading-relaxed">Risk analysis as of 11nov 2025 1130</p>
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

                    {/* Other tabs placeholders */}
                    <TabsContent value="orders" className="mt-0">
                        <div className="bg-[#131722] text-white p-12 text-center rounded-b-lg">
                            <p className="text-gray-400">No active orders</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="balance" className="mt-0">
                        <div className="bg-[#131722] text-white p-12 text-center rounded-b-lg">
                            <p className="text-gray-400">Balance history will appear here</p>
                        </div>
                    </TabsContent>
                    <TabsContent value="journal" className="mt-0">
                        <div className="bg-[#131722] text-white p-12 text-center rounded-b-lg">
                            <p className="text-gray-400">Trading journal entries will appear here</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Index;