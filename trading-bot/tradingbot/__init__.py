"""A dependency free trading bot: backtesting, analysis, risk control, execution."""

from .analysis import monte_carlo, parameter_surface, walk_forward
from .broker import AlpacaBroker, Broker, PaperBroker, build_broker
from .core import Action, Bar, BacktestResult, Fill, Order, Position, Side, Signal, Trade
from .engine import Backtester, EngineConfig, run_backtest
from .journal import Journal
from .notify import Notifier
from .portfolio import CostModel, Portfolio
from .risk import RiskConfig, RiskManager, SizingMode
from .scheduler import Scheduler
from .strategies import REGISTRY, Strategy, build

__version__ = "2.0.0"

__all__ = [
    "Action", "Bar", "BacktestResult", "Fill", "Order", "Position", "Side", "Signal", "Trade",
    "Backtester", "EngineConfig", "run_backtest",
    "CostModel", "Portfolio",
    "RiskConfig", "RiskManager", "SizingMode",
    "REGISTRY", "Strategy", "build",
    "AlpacaBroker", "Broker", "PaperBroker", "build_broker",
    "walk_forward", "monte_carlo", "parameter_surface",
    "Journal", "Notifier", "Scheduler",
    "__version__",
]
