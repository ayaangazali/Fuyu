from pydantic import BaseModel
from typing import List, Optional, Any, Union, Literal

class RiskProfile(BaseModel):
    max_position_pct: float
    stop_loss_pct: float
    take_profit_pct: float

class StrategyLogic(BaseModel):
    indicator: str
    params: dict
    buy: dict
    sell: Optional[dict] = None

class Strategy(BaseModel):
    strategy_id: str
    name: str
    description: Optional[str] = None
    risk_profile: RiskProfile
    logic: List[StrategyLogic]

class PerformanceData(BaseModel):
    timestamp: str
    market: str
    strategy_id: str
    signal: str
    price: float
    qty: float
    position_after: float
    pnl_realized: float
    pnl_unrealized: float

class AnalysisResult(BaseModel):
    action: str  # 'keep', 'modify', 'replace'
    feedback: str
    new_strategy: Optional[Strategy] = None

class ChatRequest(BaseModel):
    message: str
    strategy: Strategy
    market: Literal["crypto", "stock", "future", "forex"] = "crypto"
    includeMarketData: bool = False
    includeWebSearch: bool = False
