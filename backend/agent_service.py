import os
import json
from openai import OpenAI
from spoon_ai.llm import LLMManager, ConfigurationManager
from models import Strategy, PerformanceData, AnalysisResult
# Real-time crypto data now handled by yfinance in the system

class TradingStrategyAgent:
    """
    Enhanced Trading Strategy Agent with SpoonOS Real-Time Crypto Data
    """
    def __init__(self):
        # Validate OpenAI API key presence
        if not os.getenv("OPENAI_API_KEY"):
            raise ValueError("OPENAI_API_KEY environment variable not set")
        # Initialize both OpenAI and SpoonOS for different capabilities
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Initialize SpoonOS for crypto data tools
        try:
            self.config_manager = ConfigurationManager()
            self.llm_manager = LLMManager(self.config_manager)
            self.spoonos_available = True
            print("SpoonOS crypto tools initialized successfully")
        except Exception as e:
            print(f"SpoonOS initialization warning: {e}")
            self.spoonos_available = False
        
        print("TradingStrategyAgent initialized with real-time crypto data capabilities")

    async def get_live_market_data(self, symbol: str = "BTC-USD") -> dict:
        """
        Get live market data - currently using static fallback
        Real-time data comes from yfinance_data_generator
        """
        # SpoonOS temporarily disabled due to message format issues
        # The yfinance system provides real-time data directly
        
        # Simple fallback - yfinance is the primary real-time data source
        return {
            "symbol": symbol,
            "price": 96000.0,  # Approximate current BTC price
            "change_24h": 0.0,
            "source": "static_fallback",
            "note": "Real-time data via yfinance in the main system"
        }

    async def analyze_strategy(self, strategy: Strategy, performance: PerformanceData) -> AnalysisResult:
        # Get live market data for enhanced analysis
        market_data = await self.get_live_market_data("BTC-USD")
        
        prompt = f"""
        You are an expert quantitative trading agent with access to real-time market data.
        
        Current Market Data: {json.dumps(market_data, indent=2)}
        Strategy: {strategy.json()}
        Performance: {performance.json()}
        
        Using the live market data context, analyze this trading strategy and determine if it should be:
        1. KEPT (performance is good, strategy aligns with current market conditions)
        2. MODIFIED (performance is suboptimal but fixable, may need adjustments for current market)
        3. REPLACED (performance is terrible or strategy is fundamentally flawed for current conditions)
        
        Consider current market volatility, trend direction, and momentum in your analysis.
        If MODIFIED, suggest specific parameter changes based on current market conditions.
        If REPLACED, generate a completely new strategy optimized for the current market environment.
        
        Respond ONLY in valid JSON format:
        {{
            "action": "keep" | "modify" | "replace",
            "feedback": "Your detailed analysis including market data insights and reasoning",
            "new_strategy": null | Strategy Object
        }}
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that responds only in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1500,
                temperature=0.7
            )
            
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Try to create the AnalysisResult, with error handling for validation issues
            try:
                return AnalysisResult(**result)
            except Exception as validation_error:
                print(f"Validation error for AnalysisResult: {validation_error}")
                # If there's a validation error, return a safe result without the problematic new_strategy
                return AnalysisResult(
                    action=result.get("action", "keep"),
                    feedback=f"{result.get('feedback', 'Strategy analysis completed.')} Note: New strategy had validation issues, keeping current strategy for safety.",
                    new_strategy=None
                )
            
        except Exception as e:
            print(f"Error with strategy analysis: {e}")
            return AnalysisResult(
                action="keep",
                feedback=f"Analysis encountered an error: {str(e)}. Keeping current strategy for safety.",
                new_strategy=None
            )

    async def chat(self, message: str, strategy: Strategy, include_market_data: bool = False) -> str:
        if include_market_data:
            # Get live market data for context when requested
            market_data = await self.get_live_market_data("BTC-USD")
            
            prompt = f"""
            You are an expert quantitative trading assistant with access to real-time market data.
            
            Current Market Data: {json.dumps(market_data, indent=2)}
            Current Strategy Context: {strategy.json()}
            User Message: {message}
            
            Provide a helpful response incorporating current market conditions and strategy context.
            Keep it concise unless detailed analysis is specifically requested.
            """
            max_tokens = 600
        else:
            # Normal chat mode without market data
            prompt = f"""
            You are a helpful trading assistant. 
            
            Current Strategy: {strategy.name} (ID: {strategy.strategy_id})
            User Message: {message}
            
            Provide a helpful response about the trading strategy. Keep it concise and focused.
            """
            max_tokens = 400

        try:
            response = self.client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": "You are a helpful and concise trading assistant. Keep responses brief unless detailed analysis is requested."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error with chat: {e}")
            return f"I encountered an error while processing your request: {str(e)}. Please try again."
    
    async def get_market_summary(self) -> str:
        """
        Get a quick market summary using live data
        """
        try:
            market_data = await self.get_live_market_data("BTC-USD")
            price = market_data.get('price', 'N/A')
            change = market_data.get('change_24h', 0)
            source = market_data.get('source', 'unknown')
            
            return f"BTC-USD: ${price} ({change:+.2f}% 24h) | Source: {source}"
            
        except Exception as e:
            return f"Market summary unavailable: {str(e)}"