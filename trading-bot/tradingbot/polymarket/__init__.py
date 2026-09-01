"""Polymarket prediction market tools: books, arbitrage, Kelly sizing, paper trading."""

from .api import MissingOrderBook, PolymarketAPI, PolymarketError
from .arbitrage import ArbOpportunity, find_pair_arbitrage, scan
from .book import walk_book, walk_book_notional, slippage_curve
from .models import REGISTRY, ProbabilityModel, build
from .paper import PaperBook, PaperPosition
from .sizing import SizingConfig, kelly_fraction, position_size
from .trader import Candidate, Trader
from .types import Market, OrderBook, Level, Fill

__all__ = [
    "PolymarketAPI", "PolymarketError", "MissingOrderBook",
    "ArbOpportunity", "find_pair_arbitrage", "scan",
    "walk_book", "walk_book_notional", "slippage_curve",
    "REGISTRY", "ProbabilityModel", "build",
    "PaperBook", "PaperPosition",
    "SizingConfig", "kelly_fraction", "position_size",
    "Trader", "Candidate",
    "Market", "OrderBook", "Level", "Fill",
]
