"""
Background Scheduler Service for Automated Performance Data Generation
Automatically generates real-time performance JSON files using yfinance at regular intervals
"""

import asyncio
import threading
from datetime import datetime, timedelta
from typing import Optional, List
from yfinance_data_generator import YFinanceDataGenerator

class SchedulerService:
    """
    Background service that automatically generates performance files
    """
    
    def __init__(self, interval_minutes: int = 300, symbols: List[str] = None):
        self.interval_minutes = interval_minutes
        self.symbols = symbols or ['BTC-USD', 'ETH-USD', 'AAPL', 'TSLA']
        self.is_running = False
        self.task = None
        self.thread = None
        
        # Initialize yfinance generator
        self.yfinance_generator = YFinanceDataGenerator(
            symbols=self.symbols,
            output_dir="./performance_data"
        )
        
        # Statistics
        self.files_generated = 0
        self.last_generated_at = None
        self.errors_count = 0
        self.start_time = None
    
    async def generate_performance_file(self) -> Optional[str]:
        """
        Generate a single performance file using real market data
        """
        try:
            # Rotate through symbols for variety
            symbol = self.symbols[self.files_generated % len(self.symbols)]
            
            # Generate the performance file
            filepath = await self.yfinance_generator.generate_performance_file(symbol)
            
            if filepath:
                self.files_generated += 1
                self.last_generated_at = datetime.now()
                print(f"🔄 Scheduler generated file #{self.files_generated}: {filepath}")
                return filepath
            else:
                self.errors_count += 1
                print(f"❌ Scheduler failed to generate file for {symbol}")
                return None
                
        except Exception as e:
            self.errors_count += 1
            print(f"❌ Scheduler error generating performance file: {e}")
            return None
    
    async def _run_scheduler(self):
        """
        Main scheduler loop that runs in the background
        """
        print(f"🚀 Scheduler started: generating files every {self.interval_minutes} minutes")
        self.start_time = datetime.now()
        
        while self.is_running:
            try:
                # Generate a performance file
                await self.generate_performance_file()
                
                # Wait for the next interval
                await asyncio.sleep(self.interval_minutes * 60)
                
            except Exception as e:
                print(f"❌ Scheduler loop error: {e}")
                await asyncio.sleep(30)  # Short pause before retrying
    
    def start(self):
        """
        Start the background scheduler
        """
        if self.is_running:
            print("⚠️  Scheduler is already running")
            return False
        
        self.is_running = True
        
        # Create a new event loop for the thread
        def run_async_scheduler():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(self._run_scheduler())
        
        self.thread = threading.Thread(target=run_async_scheduler, daemon=True)
        self.thread.start()
        
        print(f"✅ Background scheduler started successfully")
        return True
    
    def stop(self):
        """
        Stop the background scheduler
        """
        if not self.is_running:
            print("⚠️  Scheduler is not running")
            return False
        
        self.is_running = False
        
        if self.thread and self.thread.is_alive():
            print("🛑 Stopping background scheduler...")
            # Thread will stop when is_running becomes False
            return True
        
        print("✅ Scheduler stopped")
        return True
    
    def get_status(self) -> dict:
        """
        Get current scheduler status and statistics
        """
        uptime_minutes = 0
        if self.start_time:
            uptime_minutes = (datetime.now() - self.start_time).total_seconds() / 60
        
        next_run_in = None
        if self.is_running and self.last_generated_at:
            next_run_time = self.last_generated_at + timedelta(minutes=self.interval_minutes)
            next_run_in = (next_run_time - datetime.now()).total_seconds() / 60
            if next_run_in < 0:
                next_run_in = 0
        
        return {
            "is_running": self.is_running,
            "interval_minutes": self.interval_minutes,
            "symbols": self.symbols,
            "files_generated": self.files_generated,
            "errors_count": self.errors_count,
            "last_generated_at": self.last_generated_at.isoformat() if self.last_generated_at else None,
            "uptime_minutes": round(uptime_minutes, 1),
            "next_run_in_minutes": round(next_run_in, 1) if next_run_in is not None else None,
            "success_rate": round(self.files_generated / (self.files_generated + self.errors_count), 2) if (self.files_generated + self.errors_count) > 0 else 0.0
        }
    
    def update_interval(self, new_interval_minutes: int):
        """
        Update the generation interval (requires restart)
        """
        self.interval_minutes = new_interval_minutes
        print(f"📝 Interval updated to {new_interval_minutes} minutes")
        
        if self.is_running:
            print("🔄 Restart required for interval change to take effect")
    
    def update_symbols(self, new_symbols: List[str]):
        """
        Update the symbols list for generation
        """
        self.symbols = new_symbols
        self.yfinance_generator.symbols = new_symbols
        print(f"📝 Symbols updated to: {new_symbols}")
    
    async def manual_generate(self, symbol: str = None) -> Optional[str]:
        """
        Manually trigger a performance file generation
        """
        if symbol:
            # Use specific symbol
            original_symbols = self.yfinance_generator.symbols
            self.yfinance_generator.symbols = [symbol]
            filepath = await self.yfinance_generator.generate_performance_file(symbol)
            self.yfinance_generator.symbols = original_symbols
            return filepath
        else:
            # Use regular rotation
            return await self.generate_performance_file()

# Global scheduler instance
global_scheduler = None

def get_scheduler(interval_minutes: int = 5, symbols: List[str] = None) -> SchedulerService:
    """
    Get or create the global scheduler instance
    """
    global global_scheduler
    
    if global_scheduler is None:
        global_scheduler = SchedulerService(interval_minutes, symbols)
    
    return global_scheduler