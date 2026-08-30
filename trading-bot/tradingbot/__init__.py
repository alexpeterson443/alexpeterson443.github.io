"""A dependency free stock trading bot: backtesting, risk control, paper trading."""

from .core import Action, Bar, BacktestResult, Fill, Order, Position, Side, Signal, Trade
from .engine import Backtester, EngineConfig, run_backtest
from .portfolio import CostModel, Portfolio
from .risk import RiskConfig, RiskManager, SizingMode
from .strategies import REGISTRY, Strategy, build

__version__ = "1.0.0"

__all__ = [
    "Action", "Bar", "BacktestResult", "Fill", "Order", "Position", "Side", "Signal", "Trade",
    "Backtester", "EngineConfig", "run_backtest",
    "CostModel", "Portfolio",
    "RiskConfig", "RiskManager", "SizingMode",
    "REGISTRY", "Strategy", "build",
    "__version__",
]
