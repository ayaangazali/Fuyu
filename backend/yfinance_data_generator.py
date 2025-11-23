"""
Real-time trading performance generator using yfinance
Gets actual market data and generates realistic performance JSON files
"""

import yfinance as yf
import json
import pandas as pd
import numpy as np
from datetime import datetime
from pathlib import Path
import random
from typing import Dict, Any

class YFinanceDataGenerator:
    """
    Generate real performance data using actual market data from yfinance
    """
    
    def __init__(self, symbols=['BTC-USD', 'ETH-USD', 'AAPL', 'TSLA'], output_dir="./performance_data"):
        self.symbols = symbols
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Trading state
        self.positions = {}
        self.trade_history = []
        self.balance = 10000.0
        self.initial_balance = 10000.0
        
        # Strategy that evolves
        self.strategy = {
            "strategy_id": "yfinance_momentum_v1",
            "name": "YFinance Momentum Strategy",
            "risk_profile": {
                "max_position_pct": 0.2,
                "stop_loss_pct": 0.03,
                "take_profit_pct": 0.06
            },
            "logic": [
                {
                    "indicator": "SMA_crossover",
                    "params": {"fast_period": 5, "slow_period": 20},
                    "buy": {"condition": "fast_above_slow"},
                    "sell": {"condition": "fast_below_slow"}
                }
            ]
        }
    
    def get_real_market_data(self, symbol: str = 'BTC-USD') -> Dict[str, Any]:
        """
        Get real-time market data using yfinance
        """
        try:
            ticker = yf.Ticker(symbol)
            
            # Get recent data (last 30 days)
            hist = ticker.history(period="30d", interval="1d")
            
            if hist.empty:
                print(f"⚠️  No data for {symbol}")
                return None
            
            # Current price (most recent close)
            current_price = float(hist['Close'].iloc[-1])
            
            # Calculate indicators
            hist['SMA_5'] = hist['Close'].rolling(window=5).mean()
            hist['SMA_20'] = hist['Close'].rolling(window=20).mean()
            hist['RSI'] = self.calculate_rsi(hist['Close'], 14)
            
            # Get current values
            current_sma5 = float(hist['SMA_5'].iloc[-1]) if not pd.isna(hist['SMA_5'].iloc[-1]) else current_price
            current_sma20 = float(hist['SMA_20'].iloc[-1]) if not pd.isna(hist['SMA_20'].iloc[-1]) else current_price
            current_rsi = float(hist['RSI'].iloc[-1]) if not pd.isna(hist['RSI'].iloc[-1]) else 50.0
            
            # Calculate price changes
            price_change_1d = ((current_price - hist['Close'].iloc[-2]) / hist['Close'].iloc[-2]) * 100
            price_change_7d = ((current_price - hist['Close'].iloc[-7]) / hist['Close'].iloc[-7]) * 100 if len(hist) >= 7 else 0
            
            # Volume data
            current_volume = float(hist['Volume'].iloc[-1])
            avg_volume = float(hist['Volume'].tail(20).mean())
            
            return {
                "symbol": symbol,
                "price": round(current_price, 2),
                "sma_5": round(current_sma5, 2),
                "sma_20": round(current_sma20, 2),
                "rsi": round(current_rsi, 1),
                "price_change_1d": round(price_change_1d, 2),
                "price_change_7d": round(price_change_7d, 2),
                "volume": current_volume,
                "avg_volume": avg_volume,
                "volume_ratio": round(current_volume / avg_volume, 2),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Error getting data for {symbol}: {e}")
            return None
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """
        Calculate RSI indicator
        """
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss.replace(0, np.inf)
        return 100 - (100 / (1 + rs))
    
    def generate_trading_signals(self, market_data: Dict[str, Any]) -> str:
        """
        Generate trading signals based on real market data
        """
        if not market_data:
            return "HOLD"
        
        symbol = market_data["symbol"]
        price = market_data["price"]
        sma_5 = market_data["sma_5"]
        sma_20 = market_data["sma_20"]
        rsi = market_data["rsi"]
        
        # SMA crossover strategy
        if sma_5 > sma_20 and rsi < 70:
            # Bullish signal - consider buying
            if symbol not in self.positions and self.balance > price * 0.1:
                return "BUY"
        
        elif sma_5 < sma_20 or rsi > 75:
            # Bearish signal - consider selling
            if symbol in self.positions:
                return "SELL"
        
        return "HOLD"
    
    def execute_trade(self, signal: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute trade and track performance
        """
        if not market_data:
            return {"pnl": 0, "position_change": 0}
        
        symbol = market_data["symbol"]
        price = market_data["price"]
        trade_result = {"pnl": 0, "position_change": 0}
        
        if signal == "BUY" and symbol not in self.positions:
            # Execute buy
            position_size = self.balance * self.strategy["risk_profile"]["max_position_pct"]
            quantity = position_size / price
            
            self.positions[symbol] = {
                "quantity": quantity,
                "entry_price": price,
                "entry_time": datetime.now(),
                "entry_value": position_size
            }
            
            self.balance -= position_size
            trade_result["position_change"] = 1
            print(f"🟢 BUY {quantity:.4f} {symbol} @ ${price}")
            
        elif signal == "SELL" and symbol in self.positions:
            # Execute sell
            position = self.positions[symbol]
            exit_value = position["quantity"] * price
            pnl = exit_value - position["entry_value"]
            
            self.balance += exit_value
            self.trade_history.append({
                "symbol": symbol,
                "entry_price": position["entry_price"],
                "exit_price": price,
                "quantity": position["quantity"],
                "pnl": pnl,
                "duration": (datetime.now() - position["entry_time"]).total_seconds() / 3600,  # hours
                "win": pnl > 0
            })
            
            del self.positions[symbol]
            trade_result["pnl"] = pnl
            trade_result["position_change"] = -1
            print(f"🔴 SELL {position['quantity']:.4f} {symbol} @ ${price} | PnL: ${pnl:.2f}")
        
        return trade_result
    
    def calculate_performance_metrics(self) -> Dict[str, Any]:
        """
        Calculate comprehensive performance metrics
        """
        if not self.trade_history:
            # Calculate unrealized PnL even with no trades
            unrealized_pnl = 0.0
            current_portfolio_value = self.balance
            for symbol, pos in self.positions.items():
                market_data = self.get_real_market_data(symbol)
                if market_data and "price" in market_data:
                    current_value = pos["quantity"] * market_data["price"]
                    unrealized_pnl += current_value - pos["entry_value"]
                    current_portfolio_value += current_value
            
            return {
                "trades_count": 0,
                "win_rate": 0.0,
                "total_pnl": 0.0,
                "unrealized_pnl": round(unrealized_pnl, 2),
                "avg_profit": 0.0,
                "avg_loss": 0.0,
                "sharpe_ratio": 0.0,
                "current_balance": round(self.balance, 2),
                "portfolio_value": round(current_portfolio_value, 2),
                "total_return": round((current_portfolio_value - self.initial_balance) / self.initial_balance, 4),
                "max_drawdown": 0.0
            }
        
        # Basic metrics
        total_trades = len(self.trade_history)
        winning_trades = [t for t in self.trade_history if t["win"]]
        losing_trades = [t for t in self.trade_history if not t["win"]]
        
        win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0
        total_pnl = sum(t["pnl"] for t in self.trade_history)
        
        avg_profit = sum(t["pnl"] for t in winning_trades) / len(winning_trades) if winning_trades else 0
        avg_loss = sum(t["pnl"] for t in losing_trades) / len(losing_trades) if losing_trades else 0
        
        # Calculate unrealized PnL for open positions
        unrealized_pnl = 0.0
        for symbol, position in self.positions.items():
            current_data = self.get_real_market_data(symbol)
            if current_data and "price" in current_data:
                current_value = position["quantity"] * current_data["price"]
                unrealized_pnl += current_value - position["entry_value"]
        
        # Simple Sharpe ratio approximation
        if len(self.trade_history) >= 2:
            returns = [t["pnl"] / self.initial_balance for t in self.trade_history[-10:]]
            avg_return = np.mean(returns)
            std_return = np.std(returns)
            sharpe_ratio = (avg_return / std_return) * np.sqrt(365) if std_return > 0 else 0
        else:
            sharpe_ratio = 0.0
        
        # Current total value
        current_portfolio_value = self.balance
        for symbol, pos in self.positions.items():
            market_data = self.get_real_market_data(symbol)
            if market_data and "price" in market_data:
                current_portfolio_value += pos["quantity"] * market_data["price"]
        
        return {
            "trades_count": total_trades,
            "win_rate": round(win_rate, 3),
            "total_pnl": round(total_pnl, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "avg_profit": round(avg_profit, 2),
            "avg_loss": round(avg_loss, 2),
            "sharpe_ratio": round(sharpe_ratio, 2),
            "current_balance": round(self.balance, 2),
            "portfolio_value": round(current_portfolio_value, 2),
            "total_return": round((current_portfolio_value - self.initial_balance) / self.initial_balance, 4),
            "max_drawdown": 0.05  # Placeholder
        }
    
    async def generate_performance_file(self, primary_symbol: str = 'BTC-USD') -> str:
        """
        Generate a complete performance JSON file using real market data
        """
        # Get real market data
        market_data = self.get_real_market_data(primary_symbol)
        if not market_data:
            print(f"❌ Could not get market data for {primary_symbol}")
            return None
        
        # Generate trading signal
        signal = self.generate_trading_signals(market_data)
        
        # Execute trade if signal generated
        trade_result = self.execute_trade(signal, market_data)
        
        # Calculate performance metrics
        metrics = self.calculate_performance_metrics()
        
        # Create performance data structure
        performance_data = {
            "strategy": self.strategy,
            "performance": {
                "timestamp": datetime.now().isoformat(),
                "market": primary_symbol,
                "strategy_id": self.strategy["strategy_id"],
                "signal": signal,
                "price": market_data["price"],
                "qty": sum(pos["quantity"] for pos in self.positions.values()),
                "position_after": len(self.positions),
                "pnl_realized": metrics["total_pnl"],
                "pnl_unrealized": metrics["unrealized_pnl"]
            },
            "market_data": market_data,
            "metadata": {
                "data_source": "yfinance",
                "generated_at": datetime.now().isoformat(),
                "active_positions": list(self.positions.keys())
            }
        }
        
        # Save to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"yfinance_performance_{timestamp}.json"
        filepath = self.output_dir / filename
        
        with open(filepath, 'w') as f:
            json.dump(performance_data, f, indent=2)
        
        print(f"📊 Generated: {filename} | {primary_symbol}: ${market_data['price']} | Signal: {signal} | Portfolio: ${metrics['portfolio_value']:.2f}")
        
        return str(filepath)

