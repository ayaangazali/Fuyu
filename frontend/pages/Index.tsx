import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, MoreVertical } from "lucide-react";

const Index = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("positions");

    // Mock chart data matching the screenshot
    const chartData = [
        { date: 'May 2021', value: 90000 },
        { date: 'Jul 2021', value: 105000 },
        { date: 'Sep 2021', value: 112000 },
        { date: 'Nov 2021', value: 118000 },
        { date: 'Jan 2022', value: 122000 },
        { date: 'Mar 2022', value: 124304.56 },
    ];

    // Positions data matching screenshot
    const positions = [
        { symbol: 'NASDAQ:AMZN', icon: '🟠', side: 'Long', qty: 5, avgPrice: '184.63', lastPrice: '220.69', unrealizedPL: '+180.32', plPercent: '+19.53%', color: 'text-green-400' },
        { symbol: 'AMEX:IVV', icon: 'ℹ️', side: 'Long', qty: 1, avgPrice: '531.08', lastPrice: '662.28', unrealizedPL: '+131.20', plPercent: '+24.70%', color: 'text-green-400' },
        { symbol: 'NYSE:BRK.B', icon: '🅱️', side: 'Long', qty: 1, avgPrice: '416.25', lastPrice: '504.04', unrealizedPL: '+87.79', plPercent: '+21.09%', color: 'text-green-400' },
        { symbol: 'AMEX:VTI', icon: '🔴', side: 'Long', qty: 5, avgPrice: '261.54', lastPrice: '323.80', unrealizedPL: '+311.30', plPercent: '+23.81%', color: 'text-green-400' },
        { symbol: 'TVC:SPX', icon: '500', side: 'Long', qty: 1, avgPrice: '5,289.05', lastPrice: '6,602.99', unrealizedPL: '+1,313.94', plPercent: '+24.84%', color: 'text-green-400' },
        { symbol: 'NASDAQ:TSLA', icon: '🔴', side: 'Long', qty: 2, avgPrice: '176.21', lastPrice: '391.09', unrealizedPL: '+429.76', plPercent: '+121.95%', color: 'text-green-400' },
        { symbol: 'NASDAQ:AAPL', icon: '🍎', side: 'Long', qty: 2, avgPrice: '189.40', lastPrice: '271.49', unrealizedPL: '+164.18', plPercent: '+43.34%', color: 'text-green-400' },
        { symbol: 'NASDAQ:MSFT', icon: '⚪', side: 'Long', qty: 1, avgPrice: '418.53', lastPrice: '472.12', unrealizedPL: '+53.59', plPercent: '+12.80%', color: 'text-green-400' },
        { symbol: 'AMEX:VOO', icon: '🔴', side: 'Long', qty: 5, avgPrice: '487.33', lastPrice: '605.93', unrealizedPL: '+593.00', plPercent: '+24.34%', color: 'text-green-400' },
    ];

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

    const fetchData = async () => {
        setIsLoading(true);
        // Backend integration would go here
        setTimeout(() => setIsLoading(false), 500);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Account Stats Bar - Black */}
            <div className="bg-[#0a0a0a] text-white px-6 py-5 border-b border-gray-800">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-6 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Account Balance</p>
                        <p className="font-semibold text-base">26,093.15</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Equity</p>
                        <p className="font-semibold text-base">29,358.23</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Realized P&L</p>
                        <p className="font-semibold text-base text-green-400">+26,093.15</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Unrealized P&L</p>
                        <p className="font-semibold text-base text-green-400">+3,265.08</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Account margin</p>
                        <p className="font-semibold text-base">30.64</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400 text-xs font-medium">Available funds</p>
                        <p className="font-semibold text-base">29,327.59</p>
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
                                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">$124,304.56</h2>
                                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap">
                                    <TrendingUp className="w-4 h-4" />
                                    37.78%
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
                                    className={`text-sm font-medium pb-2 whitespace-nowrap transition-colors ${period === '1Y'
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
                                    <XAxis dataKey="date" stroke="#999" style={{ fontSize: '12px' }} />
                                    <YAxis stroke="#999" style={{ fontSize: '12px' }} domain={[80000, 130000]} />
                                    <Tooltip />
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
                                        <p className="text-2xl font-bold text-green-600 whitespace-nowrap">+$41,234.49</p>
                                        <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                                            <TrendingUp className="w-4 h-4" />
                                            49.64%
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
                            Positions <span className="ml-2 text-gray-400">9</span>
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
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Side ↑</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Qty</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Avg Fill Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Take Profit</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Stop Loss</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Last Price</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Unrealized P&L</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Unrealized P&L %</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600">Trad</th>
                                            <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((position, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-600">
                                                            {position.symbol.split(':')[0].substring(0, 2)}
                                                        </div>
                                                        <span className="font-medium text-gray-900">{position.symbol}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-blue-600 font-medium">{position.side}</td>
                                                <td className="px-4 py-3 text-gray-900">{position.qty}</td>
                                                <td className="px-4 py-3 text-gray-900">{position.avgPrice}</td>
                                                <td className="px-4 py-3 text-gray-400">-</td>
                                                <td className="px-4 py-3 text-gray-400">-</td>
                                                <td className="px-4 py-3 text-gray-900 font-medium">{position.lastPrice}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`${position.color} font-medium`}>{position.unrealizedPL}</span>
                                                    <span className="text-gray-400 text-xs ml-1">USD</span>
                                                </td>
                                                <td className={`px-4 py-3 ${position.color} font-medium`}>{position.plPercent}</td>
                                                <td className="px-4 py-3 text-gray-500">{position.qty === 5 ? (idx === 0 ? '923.' : idx === 3 ? '1,307.' : idx === 4 ? '5,289.' : idx === 8 ? '2,436.' : '531.') : (idx === 1 ? '531.' : idx === 2 ? '416.' : idx === 5 ? '352.' : idx === 6 ? '378.' : '418.')}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <button className="hover:text-gray-600">✏️</button>
                                                        <button className="hover:text-gray-600">✕</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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