from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from coinmarketcap_service import CoinMarketCapService
from portfolio_service import PortfolioService
from agent_service import TradingStrategyAgent
from models import Strategy
import datetime


router = APIRouter()

# Dependency injection placeholders
# These will be overridden in main.py or passed via dependency injection
def get_coinmarketcap_service():
    raise NotImplementedError("CoinMarketCapService dependency not injected")

def get_portfolio_service():
    raise NotImplementedError("PortfolioService dependency not injected")

def get_trading_agent():
    raise NotImplementedError("TradingStrategyAgent dependency not injected")


@router.get("/crypto/price/{symbol}")
async def get_crypto_price(
    symbol: str, 
    cmc_service: CoinMarketCapService = Depends(get_coinmarketcap_service)
):
    """Get real-time price for a cryptocurrency"""
    if not cmc_service:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        price_data = await cmc_service.get_latest_price(symbol)
        if price_data:
            return price_data
        else:
            raise HTTPException(status_code=404, detail=f"Price data not found for {symbol}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto/prices")
async def get_multiple_crypto_prices(
    symbols: str,
    cmc_service: CoinMarketCapService = Depends(get_coinmarketcap_service)
):
    """Get real-time prices for multiple cryptocurrencies (comma-separated)"""
    if not cmc_service:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        symbol_list = [s.strip() for s in symbols.split(',')]
        price_data = await cmc_service.get_multiple_prices(symbol_list)
        if price_data:
            return price_data
        else:
            raise HTTPException(status_code=404, detail="Price data not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto/global")
async def get_global_crypto_metrics(
    cmc_service: CoinMarketCapService = Depends(get_coinmarketcap_service)
):
    """Get global cryptocurrency market metrics"""
    if not cmc_service:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        metrics = await cmc_service.get_global_metrics()
        if metrics:
            return metrics
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch global metrics")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/crypto/search/{query}")
async def search_cryptocurrency(
    query: str,
    cmc_service: CoinMarketCapService = Depends(get_coinmarketcap_service)
):
    """Search for cryptocurrencies by name or symbol"""
    if not cmc_service:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        results = await cmc_service.search_cryptocurrency(query)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolio/value")
async def get_portfolio_value(
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get current portfolio value calculated from real-time prices"""
    if not portfolio_service:
        raise HTTPException(status_code=503, detail="Portfolio service unavailable")
    
    return await portfolio_service.calculate_portfolio_value()

@router.get("/portfolio/history")
async def get_portfolio_history(
    period: str = '1Y',
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get historical portfolio value"""
    if not portfolio_service:
        raise HTTPException(status_code=503, detail="Portfolio service unavailable")
    
    return await portfolio_service.get_portfolio_history(period)

@router.get("/portfolio/risk-analysis")
async def get_portfolio_risk_analysis(
    trading_agent: TradingStrategyAgent = Depends(get_trading_agent),
    portfolio_service: PortfolioService = Depends(get_portfolio_service)
):
    """Get AI-generated risk analysis for the portfolio"""
    if not trading_agent:
        raise HTTPException(status_code=503, detail="Trading agent unavailable")
    
    try:
        # Get current holdings
        portfolio_value = await portfolio_service.calculate_portfolio_value()
        holdings = [p["symbol"] for p in portfolio_value["positions"]]
        holdings_str = ", ".join(holdings)
        
        # Construct prompt
        prompt = f"Analyze the market risk for a crypto portfolio containing: {holdings_str}. Focus on recent market news and volatility. Provide a concise 1-2 sentence risk summary."
        
        # Use agent to get analysis with web search
        # We use a dummy strategy object as it's required by the chat method
        from models import RiskProfile, StrategyLogic
        dummy_strategy = Strategy(
            strategy_id="portfolio_risk",
            name="Portfolio Risk Analysis",
            description="AI-powered portfolio risk analysis",
            risk_profile=RiskProfile(
                max_position_pct=100.0,
                stop_loss_pct=0.0,
                take_profit_pct=0.0
            ),
            logic=[]
        )
        
        analysis = await trading_agent.chat(
            message=prompt,
            strategy=dummy_strategy,
            market="crypto",
            include_market_data=True,
            include_web_search=True
        )
        
        return {
            "analysis": analysis,
            "timestamp": datetime.datetime.now().strftime("%d%b %Y %H%M").lower()
        }
        
    except Exception as e:
        print(f"Risk analysis error: {e}")
        import traceback
        traceback.print_exc()
        # Fallback if agent fails
        return {
            "analysis": "Market volatility remains high. Diversification recommended.",
            "timestamp": datetime.datetime.now().strftime("%d%b %Y %H%M").lower()
        }
