# CoinMarketCap API Endpoints

@app.get("/crypto/price/{symbol}")
async def get_crypto_price(symbol: str):
    """Get real-time price for a cryptocurrency"""
    if not coinmarketcap:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        price_data = await coinmarketcap.get_latest_price(symbol)
        if price_data:
            return price_data
        else:
            raise HTTPException(status_code=404, detail=f"Price data not found for {symbol}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/prices")
async def get_multiple_crypto_prices(symbols: str):
    """Get real-time prices for multiple cryptocurrencies (comma-separated)"""
    if not coinmarketcap:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        symbol_list = [s.strip() for s in symbols.split(',')]
        price_data = await coinmarketcap.get_multiple_prices(symbol_list)
        if price_data:
            return price_data
        else:
            raise HTTPException(status_code=404, detail="Price data not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/global")
async def get_global_crypto_metrics():
    """Get global cryptocurrency market metrics"""
    if not coinmarketcap:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        metrics = await coinmarketcap.get_global_metrics()
        if metrics:
            return metrics
        else:
            raise HTTPException(status_code=500, detail="Failed to fetch global metrics")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/crypto/search/{query}")
async def search_cryptocurrency(query: str):
    """Search for cryptocurrencies by name or symbol"""
    if not coinmarketcap:
        raise HTTPException(status_code=503, detail="CoinMarketCap service unavailable")
    
    try:
        results = await coinmarketcap.search_cryptocurrency(query)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/portfolio/value")
async def get_portfolio_value():
    """Get current portfolio value (mock data for now)"""
    # TODO: Integrate with real portfolio tracking
    return {
        "total_value": 125430.50,
        "total_change_24h": 2.35,
        "positions": [
            {"symbol": "BTC", "quantity": 0.5, "value": 48000.00},
            {"symbol": "ETH", "quantity": 5.0, "value": 15000.00},
            {"symbol": "SOL", "quantity": 100.0, "value": 12000.00}
        ],
        "last_updated": "2025-11-23T09:44:00Z"
    }
