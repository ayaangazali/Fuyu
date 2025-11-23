from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models import Strategy, PerformanceData, AnalysisResult, ChatRequest
from agent_service import TradingStrategyAgent
from performance_analyzer import PerformanceAnalyzer
from yfinance_data_generator import YFinanceDataGenerator
from scheduler_service import get_scheduler
from websocket_manager import websocket_manager

import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8082", "http://localhost:5173"], # Allow frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

trading_agent = TradingStrategyAgent()
performance_analyzer = PerformanceAnalyzer(trading_agent)
yfinance_generator = YFinanceDataGenerator()

# Initialize scheduler service
scheduler = get_scheduler(interval_minutes=5, symbols=['BTC-USD', 'ETH-USD', 'AAPL', 'TSLA'])

# Start performance monitoring
performance_analyzer.start_monitoring()
print("Performance monitoring started - drop JSON files in ./performance_data/")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time strategy updates"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive and handle any incoming messages
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            await websocket_manager.send_personal_message(f"Server received: {data}", websocket)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "Quantum Trade Agent API is running"}

@app.post("/analyze", response_model=AnalysisResult)
async def analyze_strategy(request: dict):
    try:
        strategy = Strategy(**request["strategy"])
        performance = PerformanceData(**request["performance"])
        result = await trading_agent.analyze_strategy(strategy, performance)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_agent(request: ChatRequest):
    try:
        response = await trading_agent.chat(request.message, request.strategy, request.includeMarketData)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Removed: Use /yfinance/market/{symbol} for real-time market data instead

@app.get("/market-summary")
async def get_market_summary():
    try:
        summary = await trading_agent.get_market_summary()
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/performance/analyze")
async def analyze_performance_file(file_path: str):
    """Manually trigger analysis of a specific performance file"""
    try:
        result = await performance_analyzer.process_performance_file(file_path)
        return {"analysis": result.dict() if result else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/recent")
async def get_recent_analyses(hours: int = 24):
    """Get recent performance analyses"""
    try:
        recent = performance_analyzer.get_recent_analyses(hours)
        return {"recent_analyses": recent, "count": len(recent)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/performance/status")
async def get_performance_status():
    """Get status of performance monitoring system"""
    try:
        return {
            "monitoring": performance_analyzer.observer is not None and performance_analyzer.observer.is_alive(),
            "watch_directory": str(performance_analyzer.watch_directory),
            "cached_analyses": len(performance_analyzer.performance_cache)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/yfinance/generate")
async def generate_yfinance_performance(symbol: str = "BTC-USD"):
    """Generate real performance data using yfinance"""
    try:
        filepath = await yfinance_generator.generate_performance_file(symbol)
        return {
            "message": "Real-time performance file generated using yfinance",
            "filepath": filepath,
            "symbol": symbol
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yfinance/market/{symbol}")
async def get_yfinance_market_data(symbol: str):
    """Get real-time market data for a symbol using yfinance"""
    try:
        market_data = yfinance_generator.get_real_market_data(symbol)
        return market_data or {"error": f"No data available for {symbol}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/yfinance/status")
async def get_yfinance_status():
    """Get yfinance generator status"""
    try:
        metrics = yfinance_generator.calculate_performance_metrics()
        return {
            "portfolio_value": metrics["portfolio_value"],
            "total_return": metrics["total_return"],
            "trades_count": metrics["trades_count"],
            "win_rate": metrics["win_rate"],
            "active_positions": list(yfinance_generator.positions.keys()),
            "strategy": yfinance_generator.strategy["name"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Scheduler API Endpoints
@app.post("/scheduler/start")
async def start_scheduler():
    """Start the background performance file generator"""
    try:
        success = scheduler.start()
        if success:
            return {
                "message": "Background scheduler started successfully",
                "status": scheduler.get_status()
            }
        else:
            return {
                "message": "Scheduler is already running",
                "status": scheduler.get_status()
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduler/stop")
async def stop_scheduler():
    """Stop the background performance file generator"""
    try:
        success = scheduler.stop()
        return {
            "message": "Scheduler stopped successfully" if success else "Scheduler was not running",
            "status": scheduler.get_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scheduler/status")
async def get_scheduler_status():
    """Get current scheduler status and statistics"""
    try:
        return scheduler.get_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduler/manual")
async def manual_generate(symbol: str = "BTC-USD"):
    """Manually trigger a performance file generation"""
    try:
        filepath = await scheduler.manual_generate(symbol)
        if filepath:
            return {
                "message": f"Performance file generated manually for {symbol}",
                "filepath": filepath,
                "status": scheduler.get_status()
            }
        else:
            raise HTTPException(status_code=500, detail=f"Failed to generate performance file for {symbol}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/scheduler/config")
async def update_scheduler_config(interval_minutes: int = None, symbols: str = None):
    """Update scheduler configuration"""
    try:
        if interval_minutes:
            scheduler.update_interval(interval_minutes)
        
        if symbols:
            # Parse comma-separated symbols
            symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
            scheduler.update_symbols(symbol_list)
        
        return {
            "message": "Scheduler configuration updated",
            "status": scheduler.get_status()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
