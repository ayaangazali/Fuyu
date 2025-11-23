// export const mockDeck = [
//     {
//         strategy_id: "macd_trend_v2",
//         name: "MACD Trend Follower",
//         description: "Follows strong trends using MACD crossover",
//         risk_profile: {
//             max_position_pct: 0.15,
//             stop_loss_pct: 0.02,
//             take_profit_pct: 0.05
//         },
//         logic: [
//             {
//                 indicator: "MACD",
//                 params: { fast: 12, slow: 26, signal: 9 },
//                 buy: { condition: "macd_crosses_above_signal" },
//                 sell: { condition: "macd_crosses_below_signal" }
//             },
//             {
//                 indicator: "Volume",
//                 params: { period: 20 },
//                 buy: { condition: "volume_above_ma" },
//                 sell: { condition: "ignore" }
//             }
//         ]
//     },
//     {
//         strategy_id: "bb_breakout_v1",
//         name: "Bollinger Band Breakout",
//         description: "Captures volatility breakouts",
//         risk_profile: {
//             max_position_pct: 0.1,
//             stop_loss_pct: 0.04,
//             take_profit_pct: 0.08
//         },
//         logic: [
//             {
//                 indicator: "Bollinger Bands",
//                 params: { period: 20, std_dev: 2 },
//                 buy: { condition: "price_crosses_above_upper" },
//                 sell: { condition: "price_crosses_below_lower" }
//             }
//         ]
//     }
// ];
