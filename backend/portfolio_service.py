import asyncio
from typing import List, Dict, Optional
from datetime import datetime
from coinmarketcap_service import CoinMarketCapService
import yfinance as yf
import pandas as pd

class PortfolioService:
    """
    Service for managing user portfolio and calculating real-time value
    """
    
    def __init__(self, cmc_service: CoinMarketCapService):
        self.cmc_service = cmc_service
        # Hardcoded positions for demonstration
        # In a real app, this would come from a database
        self.holdings = [
            {"symbol": "BTC", "quantity": 0.5, "avg_price": 65000.00},
            {"symbol": "ETH", "quantity": 5.0, "avg_price": 3500.00},
            {"symbol": "SOL", "quantity": 100.0, "avg_price": 120.00},
            {"symbol": "AVAX", "quantity": 50.0, "avg_price": 35.00},
            {"symbol": "DOT", "quantity": 200.0, "avg_price": 7.50}
        ]
        print("PortfolioService initialized with demo holdings")

    async def calculate_portfolio_value(self) -> Dict:
        """
        Calculate current portfolio value based on real-time prices
        
        Returns:
            Dictionary with total value, 24h change, and detailed positions
        """
        try:
            # Get symbols list
            symbols = [h["symbol"] for h in self.holdings]
            
            # Fetch current prices
            prices_response = await self.cmc_service.get_multiple_prices(symbols)
            
            if not prices_response or not prices_response.get("success"):
                # Fallback to mock data if API fails
                print("Failed to fetch prices, using fallback data")
                return self._get_fallback_data()
            
            market_data = prices_response["data"]
            
            total_value = 0.0
            total_cost_basis = 0.0
            positions = []
            
            for holding in self.holdings:
                symbol = holding["symbol"]
                quantity = holding["quantity"]
                avg_price = holding["avg_price"]
                
                if symbol in market_data:
                    data = market_data[symbol]
                    current_price = data["price"]
                    percent_change_24h = data["percent_change_24h"]
                    
                    position_value = quantity * current_price
                    cost_basis = quantity * avg_price
                    
                    total_value += position_value
                    total_cost_basis += cost_basis
                    
                    positions.append({
                        "symbol": symbol,
                        "quantity": quantity,
                        "value": position_value,
                        "current_price": current_price,
                        "avg_price": avg_price,
                        "percent_change_24h": percent_change_24h,
                        "unrealized_pl": position_value - cost_basis,
                        "unrealized_pl_percent": ((current_price - avg_price) / avg_price) * 100
                    })
            
            # Calculate total portfolio change
            total_unrealized_pl = total_value - total_cost_basis
            total_change_percent = (total_unrealized_pl / total_cost_basis) * 100 if total_cost_basis > 0 else 0
            
            # Calculate 24h change (weighted average of individual 24h changes)
            # This is an approximation. A more accurate way would be comparing to portfolio value 24h ago.
            # For now, we'll use the weighted average of 24h percent changes.
            weighted_change_sum = sum(p["percent_change_24h"] * p["value"] for p in positions)
            total_change_24h = weighted_change_sum / total_value if total_value > 0 else 0
            
            return {
                "total_value": total_value,
                "total_change_24h": total_change_24h,
                "total_unrealized_pl": total_unrealized_pl,
                "total_change_percent": total_change_percent,
                "positions": positions,
                "last_updated": datetime.utcnow().isoformat() + "Z"
            }
            
        except Exception as e:
            print(f"Error calculating portfolio value: {e}")
            return self._get_fallback_data()

    async def get_portfolio_history(self, period: str = '1Y') -> List[Dict]:
        """
        Get historical portfolio value based on current holdings
        Note: This assumes constant holdings over time (simplified)
        
        Args:
            period: Time period (1M, 6M, YTD, 1Y, 5Y, MAX)
            
        Returns:
            List of data points {date, value}
        """
        try:
            # Map period to yfinance format
            period_map = {
                '1M': '1mo',
                '6M': '6mo',
                'YTD': 'ytd',
                '1Y': '1y',
                '5Y': '5y',
                'MAX': 'max'
            }
            yf_period = period_map.get(period, '1y')
            
            # Prepare symbols for yfinance (append -USD for crypto)
            tickers = [f"{h['symbol']}-USD" for h in self.holdings]
            
            # Fetch historical data in batch
            # Use asyncio.to_thread since yfinance is synchronous
            hist_data = await asyncio.to_thread(
                yf.download, 
                tickers=tickers, 
                period=yf_period, 
                interval="1d", 
                progress=False
            )
            
            if hist_data.empty:
                return []
            
            # Calculate portfolio value for each day
            # hist_data['Close'] contains columns for each ticker
            # Note: yfinance structure varies depending on number of tickers
            # If multiple tickers, 'Close' is a DataFrame with columns as tickers
            if len(tickers) > 1:
                closes = hist_data['Close']
            else:
                closes = hist_data[['Close']]
                closes.columns = tickers
            
            portfolio_history = []
            
            # Iterate through dates
            for date, row in closes.iterrows():
                daily_value = 0.0
                valid_data = True
                
                for holding in self.holdings:
                    symbol = holding['symbol']
                    ticker = f"{symbol}-USD"
                    quantity = holding['quantity']
                    
                    # Handle case where some tickers might be missing data for some dates
                    val = 0
                    if ticker in row and not pd.isna(row[ticker]):
                        val = row[ticker]
                    elif len(tickers) == 1 and not pd.isna(row.iloc[0]): # Single ticker case
                         val = row.iloc[0]
                         
                    daily_value += val * quantity
                
                if daily_value > 0:
                    portfolio_history.append({
                        "date": date.strftime("%Y-%m-%d"),
                        "value": daily_value
                    })
            
            return portfolio_history
            
        except Exception as e:
            print(f"Error fetching portfolio history: {e}")
            import traceback
            traceback.print_exc()
            return []

    def _get_fallback_data(self) -> Dict:
        """Return mock data if calculation fails"""
        return {
            "total_value": 125430.50,
            "total_change_24h": 2.35,
            "positions": [
                {"symbol": "BTC", "quantity": 0.5, "value": 48000.00},
                {"symbol": "ETH", "quantity": 5.0, "value": 15000.00},
                {"symbol": "SOL", "quantity": 100.0, "value": 12000.00}
            ],
            "last_updated": datetime.utcnow().isoformat() + "Z"
        }
