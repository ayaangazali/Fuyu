"""
Real Performance Data Analyzer for Fuyu Trading Platform
Processes actual trading performance JSON files and triggers SpoonOS analysis
"""

import os
import json
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from models import Strategy, PerformanceData, AnalysisResult
from websocket_manager import websocket_manager

class PerformanceFileHandler(FileSystemEventHandler):
    """
    File system event handler for monitoring performance JSON files
    """
    
    def __init__(self, analyzer):
        self.analyzer = analyzer
        
    def on_created(self, event):
        if not event.is_directory and event.src_path.endswith('.json'):
            # Ignore analysis files to prevent infinite loop
            if '_analysis.json' in event.src_path:
                return
            print(f"New performance file detected: {event.src_path}")
            # Schedule analysis using thread-safe approach
            self._schedule_analysis(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory and event.src_path.endswith('.json'):
            # Ignore analysis files to prevent infinite loop
            if '_analysis.json' in event.src_path:
                return
            print(f"Performance file updated: {event.src_path}")
            # Schedule analysis using thread-safe approach
            self._schedule_analysis(event.src_path)
    
    def _schedule_analysis(self, file_path):
        """Schedule analysis in a thread-safe manner"""
        def run_analysis():
            # Create a new event loop for this thread if one doesn't exist
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            try:
                loop.run_until_complete(self.analyzer.process_performance_file(file_path))
            except Exception as e:
                print(f"Error processing file {file_path}: {e}")
        
        # Run in a separate thread to avoid blocking the file watcher
        thread = threading.Thread(target=run_analysis, daemon=True)
        thread.start()

class PerformanceAnalyzer:
    """
    Real performance data analyzer using SpoonOS
    """
    
    def __init__(self, trading_agent, watch_directory: str = "./performance_data"):
        self.trading_agent = trading_agent
        self.watch_directory = Path(watch_directory)
        self.watch_directory.mkdir(exist_ok=True)
        
        # File monitoring
        self.observer = None
        self.file_handler = PerformanceFileHandler(self)
        
        # Performance metrics cache
        self.performance_cache = {}
        
    def start_monitoring(self):
        """
        Start monitoring the performance data directory
        """
        self.observer = Observer()
        self.observer.schedule(
            self.file_handler, 
            str(self.watch_directory), 
            recursive=True
        )
        self.observer.start()
        print(f"Started monitoring {self.watch_directory} for performance files")
    
    def stop_monitoring(self):
        """
        Stop monitoring the performance data directory
        """
        if self.observer:
            self.observer.stop()
            self.observer.join()
            print("Stopped performance file monitoring")
    
    async def process_performance_file(self, file_path: str) -> Optional[AnalysisResult]:
        """
        Process a performance JSON file and trigger SpoonOS analysis
        """
        try:
            # Broadcast analysis status
            await websocket_manager.broadcast_analysis_status("analyzing", f"Analyzing performance file: {Path(file_path).name}")
            
            # Wait a bit for file to be fully written
            await asyncio.sleep(1)
            
            try:
                with open(file_path, 'r') as f:
                    performance_data = json.load(f)
            except OSError as e:
                print(f"File I/O error while opening {file_path}: {e}")
                await websocket_manager.broadcast_analysis_status("idle", f"File I/O error: {e}")
                return None
            except json.JSONDecodeError as e:
                print(f"JSON decode error in file {file_path}: {e}")
                await websocket_manager.broadcast_analysis_status("idle", f"JSON decode error: {e}")
                return None
            
            print(f"📈 Processing performance file: {file_path}")
            
            # Extract strategy and performance information
            strategy_data = performance_data.get('strategy', {})
            metrics = performance_data.get('performance', performance_data.get('metrics', {}))
            
            # Create Strategy object
            strategy = Strategy(
                strategy_id=strategy_data.get('strategy_id', 'unknown'),
                name=strategy_data.get('name', 'Unknown Strategy'),
                risk_profile=strategy_data.get('risk_profile', {
                    'max_position_pct': 0.2,
                    'stop_loss_pct': 0.03,
                    'take_profit_pct': 0.06
                }),
                logic=strategy_data.get('logic', [])
            )
            
            # Create PerformanceData object
            performance = PerformanceData(
                timestamp=metrics.get('timestamp', datetime.now().isoformat()),
                market=metrics.get('market', 'BTC-USD'),
                strategy_id=strategy.strategy_id,
                signal=metrics.get('signal', 'NONE'),
                price=float(metrics.get('price', 0)),
                qty=float(metrics.get('qty', 0)),
                position_after=float(metrics.get('position_after', 0)),
                pnl_realized=float(metrics.get('pnl_realized', 0)),
                pnl_unrealized=float(metrics.get('pnl_unrealized', 0))
            )
            
            # Trigger SpoonOS analysis
            analysis_result = await self.trading_agent.analyze_strategy(strategy, performance)
            
            # Save analysis result
            await self.save_analysis_result(file_path, analysis_result, performance_data)
            
            # Cache the results
            self.performance_cache[file_path] = {
                'performance_data': performance_data,
                'analysis_result': analysis_result,
                'processed_at': datetime.now().isoformat()
            }
            
            print(f"✅ Analysis complete for {Path(file_path).name}: Action = {analysis_result.action.upper()}")
            
            # Broadcast strategy update to frontend
            await self._broadcast_strategy_update(strategy_data, analysis_result)
            
            # Broadcast analysis completion
            await websocket_manager.broadcast_analysis_status("idle", f"Analysis complete: {analysis_result.action.upper()}")
            
            return analysis_result
            
        except Exception as e:
            print(f"Error processing performance file {file_path}: {e}")
            await websocket_manager.broadcast_analysis_status("idle", f"Analysis failed: {str(e)}")
            return None
    
    async def _broadcast_strategy_update(self, old_strategy_data: dict, analysis_result: AnalysisResult):
        """
        Broadcast strategy update to connected WebSocket clients
        """
        try:
            if analysis_result.action in ['modify', 'replace'] and analysis_result.new_strategy:
                # Convert Pydantic model to dict for broadcasting
                new_strategy_dict = analysis_result.new_strategy.dict()
                
                await websocket_manager.broadcast_strategy_update(
                    action=analysis_result.action,
                    old_strategy=old_strategy_data,
                    new_strategy=new_strategy_dict,
                    feedback=analysis_result.feedback
                )
            elif analysis_result.action == 'keep':
                # Broadcast that strategy was kept
                await websocket_manager.broadcast_strategy_update(
                    action='keep',
                    old_strategy=old_strategy_data,
                    new_strategy=old_strategy_data,
                    feedback=analysis_result.feedback
                )
        except Exception as e:
            print(f"Error broadcasting strategy update: {e}")
    
    async def save_analysis_result(self, original_file: str, result: AnalysisResult, original_data: dict):
        """
        Save the analysis result alongside the original performance data
        """
        try:
            # Create analysis result file path
            original_path = Path(original_file)
            result_file = original_path.parent / f"{original_path.stem}_analysis.json"
            
            # Prepare analysis data
            analysis_data = {
                'original_file': str(original_path),
                'analyzed_at': datetime.now().isoformat(),
                'analysis_result': {
                    'action': result.action,
                    'feedback': result.feedback,
                    'new_strategy': result.new_strategy.dict() if result.new_strategy else None
                },
                'original_performance': original_data
            }
            
            # Save analysis result
            with open(result_file, 'w') as f:
                json.dump(analysis_data, f, indent=2, default=str)
                
            print(f"Analysis result saved to: {result_file}")
            
        except Exception as e:
            print(f"Error saving analysis result: {e}")
    
    def get_recent_analyses(self, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get recent analysis results
        """
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_analyses = []
        
        for file_path, cached_data in self.performance_cache.items():
            processed_time = datetime.fromisoformat(cached_data['processed_at'])
            if processed_time > cutoff_time:
                recent_analyses.append({
                    'file': file_path,
                    'processed_at': cached_data['processed_at'],
                    'action': cached_data['analysis_result'].action,
                    'feedback': cached_data['analysis_result'].feedback
                })
        
        return sorted(recent_analyses, key=lambda x: x['processed_at'], reverse=True)
    
    async def analyze_existing_files(self):
        """
        Process any existing performance files in the directory
        """
        json_files = list(self.watch_directory.glob("*.json"))
        if not json_files:
            print(f"No existing performance files found in {self.watch_directory}")
            return
        
        print(f"Found {len(json_files)} existing performance files to analyze")
        
        for json_file in json_files:
            if not json_file.name.endswith('_analysis.json'):  # Skip analysis files
                await self.process_performance_file(str(json_file))
    
