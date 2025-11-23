from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Optional
from coinmarketcap_service import CoinMarketCapService
from portfolio_service import PortfolioService

router = APIRouter()

# Dependency injection placeholders
# These will be overridden in main.py or passed via dependency injection
def get_coinmarketcap_service():
    raise NotImplementedError("CoinMarketCapService dependency not injected")

def get_portfolio_service():
    raise NotImplementedError("PortfolioService dependency not injected")

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
