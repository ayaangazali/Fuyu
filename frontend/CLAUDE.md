# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Fuyu** - an AI-powered trading strategy customization platform called "QuantumTrade". It's a React TypeScript application with a Python FastAPI backend that provides real-time strategy analysis, modification, and chat capabilities for trading algorithms.

## Development Commands

```bash
# Frontend (Vite + React + TypeScript)
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build

# Backend (Python FastAPI)
cd backend
pip install -r requirements.txt
python main.py       # Start FastAPI server on localhost:8000
```

## Architecture

### Frontend Structure
- **React 18** with **TypeScript** and **Vite** for fast development
- **shadcn/ui** component library built on **Radix UI** primitives
- **Tailwind CSS** for styling with custom neon cyan/purple theme
- **TanStack Query** for server state management
- **React Router** for navigation
- **Framer Motion** for animations

### Key Components
- `src/pages/Index.tsx` - Main dashboard with live strategy display and controls
- `src/components/ChatInterface.tsx` - AI chat interface for strategy discussions (connects to backend /chat endpoint)
- `src/components/StrategyRules.tsx` - Visual display of active trading strategy rules
- `src/hooks/useStrategyCycle.ts` - Core hook managing strategy analysis cycles (connects to backend /analyze endpoint)

### Backend Structure
- **FastAPI** server with two main endpoints:
  - `POST /analyze` - Analyzes strategy performance and returns action (keep/modify/replace)
  - `POST /chat` - Handles chat interactions about strategies
- `agent_service.py` - AI service for strategy analysis and chat responses
- `models.py` - Pydantic models for API data structures

### Data Flow
1. Frontend sends strategy + performance data to backend `/analyze`
2. Backend AI agent evaluates performance and returns action (keep/modify/replace) with optional new strategy
3. Frontend updates strategy state and UI based on backend response
4. Chat interface allows real-time discussion about strategies via `/chat` endpoint

### Strategy Schema
Strategies follow this structure:
```typescript
interface Strategy {
    strategy_id: string;
    name: string; 
    description?: string;
    risk_profile: {
        max_position_pct: number;
        stop_loss_pct: number;
        take_profit_pct: number;
    };
    logic: Array<{
        indicator: string;
        params: Record<string, any>;
        buy?: any;
        sell?: any;
    }>;
}
```

## Key Features

### Auto-Analysis Cycle
- 5-minute intervals when running
- Sends mock performance data to backend for AI analysis
- Automatically modifies or replaces strategies based on AI recommendations
- Real-time status updates and logging

### AI Chat Integration
- Chat interface connects to backend for strategy discussions
- Context-aware responses based on current strategy configuration
- Error handling for backend connectivity issues

## Development Notes

- **Styling**: Uses custom CSS variables for neon-cyan and neon-purple theme colors
- **State Management**: React hooks + TanStack Query, no external state library
- **API Integration**: Hardcoded localhost:8000 backend endpoints
- **Mock Data**: Uses `src/data/mockDeck.ts` for strategy examples
- **TypeScript**: Strict typing throughout, some `any` types for flexibility in strategy logic
- **ESLint**: Configured with React hooks and TypeScript rules, unused vars disabled