"""
CoinMarketCap API Service
Provides real-time cryptocurrency prices, market cap, volume, and historical data
"""

import os
import asyncio
from typing import Optional, Dict, List
import aiohttp
from datetime import datetime, timedelta

class CoinMarketCapService:
    """
    Service for querying CoinMarketCap API for cryptocurrency data
    """
    
    BASE_URL = "https://pro-api.coinmarketcap.com/v1"
    SANDBOX_URL = "https://sandbox-api.coinmarketcap.com/v1"
    
    def __init__(self, use_sandbox: bool = False):
        api_key = os.getenv("COINMARKETCAP_API_KEY")
        if not api_key:
            raise ValueError("COINMARKETCAP_API_KEY environment variable not set")
        
        self.api_key = api_key
        self.base_url = self.SANDBOX_URL if use_sandbox else self.BASE_URL
        self.headers = {
            'X-CMC_PRO_API_KEY': self.api_key,
            'Accept': 'application/json'
        }
        self.available = True
        print(f"CoinMarketCap service initialized ({'sandbox' if use_sandbox else 'production'} mode)")
    
    async def get_latest_price(self, symbol: str, convert: str = 'USD') -> Optional[Dict]:
        """
        Get latest price for a cryptocurrency
        
        Args:
            symbol: Crypto symbol (e.g., 'BTC', 'ETH')
            convert: Currency to convert to (default: 'USD')
        
        Returns:
            Dictionary with price data
        """
        try:
            url = f"{self.base_url}/cryptocurrency/quotes/latest"
            params = {
                'symbol': symbol.upper(),
                'convert': convert.upper()
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if 'data' in data and symbol.upper() in data['data']:
                            crypto_data = data['data'][symbol.upper()]
                            quote = crypto_data['quote'][convert.upper()]
                            
                            return {
                                "symbol": symbol.upper(),
                                "name": crypto_data['name'],
                                "price": quote['price'],
                                "volume_24h": quote['volume_24h'],
                                "market_cap": quote['market_cap'],
                                "percent_change_1h": quote['percent_change_1h'],
                                "percent_change_24h": quote['percent_change_24h'],
                                "percent_change_7d": quote['percent_change_7d'],
                                "last_updated": quote['last_updated'],
                                "success": True
                            }
                    else:
                        error_text = await response.text()
                        print(f"CoinMarketCap API error ({response.status}): {error_text}")
                        
            return None
            
        except Exception as e:
            print(f"Error fetching price data: {e}")
            return None
    
    async def get_multiple_prices(self, symbols: List[str], convert: str = 'USD') -> Optional[Dict]:
        """
        Get latest prices for multiple cryptocurrencies
        
        Args:
            symbols: List of crypto symbols (e.g., ['BTC', 'ETH', 'ADA'])
            convert: Currency to convert to
        
        Returns:
            Dictionary with prices for all symbols
        """
        try:
            url = f"{self.base_url}/cryptocurrency/quotes/latest"
            params = {
                'symbol': ','.join([s.upper() for s in symbols]),
                'convert': convert.upper()
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        result = {}
                        if 'data' in data:
                            for symbol in symbols:
                                sym = symbol.upper()
                                if sym in data['data']:
                                    crypto_data = data['data'][sym]
                                    quote = crypto_data['quote'][convert.upper()]
                                    
                                    result[sym] = {
                                        "name": crypto_data['name'],
                                        "price": quote['price'],
                                        "percent_change_24h": quote['percent_change_24h'],
                                        "market_cap": quote['market_cap'],
                                        "volume_24h": quote['volume_24h']
                                    }
                        
                        return {
                            "data": result,
                            "success": True
                        }
                    
            return None
            
        except Exception as e:
            print(f"Error fetching multiple prices: {e}")
            return None
    
    async def get_global_metrics(self) -> Optional[Dict]:
        """
        Get global cryptocurrency market metrics
        
        Returns:
            Dictionary with global market data
        """
        try:
            url = f"{self.base_url}/global-metrics/quotes/latest"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if 'data' in data:
                            metrics = data['data']
                            quote = metrics['quote']['USD']
                            
                            return {
                                "total_market_cap": quote['total_market_cap'],
                                "total_volume_24h": quote['total_volume_24h'],
                                "btc_dominance": metrics['btc_dominance'],
                                "eth_dominance": metrics['eth_dominance'],
                                "active_cryptocurrencies": metrics['active_cryptocurrencies'],
                                "last_updated": metrics['last_updated'],
                                "success": True
                            }
            
            return None
            
        except Exception as e:
            print(f"Error fetching global metrics: {e}")
            return None
    
    async def search_cryptocurrency(self, query: str) -> Optional[List[Dict]]:
        """
        Search for cryptocurrencies by name or symbol
        
        Args:
            query: Search query
        
        Returns:
            List of matching cryptocurrencies
        """
        try:
            url = f"{self.base_url}/cryptocurrency/map"
            params = {
                'symbol': query.upper()
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.headers, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if 'data' in data:
                            results = []
                            for crypto in data['data'][:10]:  # Limit to top 10 results
                                results.append({
                                    "id": crypto['id'],
                                    "name": crypto['name'],
                                    "symbol": crypto['symbol'],
                                    "rank": crypto.get('rank', None)
                                })
                            
                            return results
            
            return []
            
        except Exception as e:
            print(f"Error searching cryptocurrency: {e}")
            return []
