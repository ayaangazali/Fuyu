"""
Desearch Service for Real-Time Web Search
Provides real-time news and sentiment from Web, Twitter/X, and Reddit
"""

import os
from typing import Optional, Dict
from desearch_py import Desearch

class DesearchService:
    """
    Service for querying Desearch API for market news and sentiment
    """
    
    def __init__(self):
        api_key = os.getenv("DESEARCH_API_KEY")
        if not api_key:
            raise ValueError("DESEARCH_API_KEY environment variable not set")
        
        self.client = Desearch(api_key)
        self.available = True
        print("Desearch service initialized successfully")
    
    def get_market_news(self, symbol: str, timeframe: str = 'PAST_24_HOURS') -> Optional[Dict]:
        """
        Get real-time news and sentiment for a trading symbol
        
        Args:
            symbol: Trading symbol (e.g., 'BTC-USD', 'AAPL', 'ETH')
            timeframe: Time filter ('PAST_HOUR', 'PAST_6_HOURS', 'PAST_24_HOURS')
        
        Returns:
            Dictionary with summary, sources, and sentiment data
        """
        try:
            # Clean symbol for better search results
            clean_symbol = symbol.replace('-USD', '').replace('-', ' ')
            
            prompt = f'Latest news, market sentiment, and price action for {clean_symbol}'
            
            result = self.client.ai_search(
                prompt=prompt,
                tools=['Web', 'X (Twitter)', 'Reddit'],
                model='ORBIT',
                streaming=False,
                date_filter=timeframe
            )
            
            return {
                "summary": result.summary if hasattr(result, 'summary') else str(result),
                "sources": getattr(result, 'sources', [])[:5],  # Limit to top 5 sources
                "query": prompt,
                "timeframe": timeframe,
                "success": True
            }
            
        except Exception as e:
            print(f"Desearch API error: {e}")
            return {
                "summary": f"Unable to fetch live news data: {str(e)}",
                "sources": [],
                "query": f"Latest news on {symbol}",
                "timeframe": timeframe,
                "success": False,
                "error": str(e)
            }
    
    def search_trading_topic(self, query: str, timeframe: str = 'PAST_24_HOURS') -> Optional[Dict]:
        """
        General search for trading-related topics
        
        Args:
            query: Search query from user
            timeframe: Time filter
        
        Returns:
            Dictionary with search results
        """
        try:
            result = self.client.ai_search(
                prompt=query,
                tools=['Web', 'X (Twitter)', 'Reddit', 'Hacker News'],
                model='ORBIT',
                streaming=False,
                date_filter=timeframe
            )
            
            return {
                "summary": result.summary if hasattr(result, 'summary') else str(result),
                "sources": getattr(result, 'sources', [])[:5],
                "query": query,
                "timeframe": timeframe,
                "success": True
            }
            
        except Exception as e:
            print(f"Desearch search error: {e}")
            return {
                "summary": f"Search unavailable: {str(e)}",
                "sources": [],
                "query": query,
                "timeframe": timeframe,
                "success": False,
                "error": str(e)
            }
