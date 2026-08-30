# Trading Bot

A stock trading bot with a backtesting engine, a risk management layer, and a
paper trading loop. Pure Python, **zero third party dependencies**, 171 tests.

It simulates trading. It does not touch real money, and the live path is wired
to a paper account only.

```
$ python run.py backtest --symbols AAPL,MSFT --strategy macd_trend

====================================================================
  macd_trend(fast=12, signal=9, slow=26, trend_filter=200)
  AAPL, MSFT   2019-01-01 to 2024-12-31
====================================================================

  ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▃▂▁▂▄▅▄▅▆▅▆█▆▆▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
  $10,000.00                                            $10,540.59

  RETURNS
    Total return                    5.41%
    CAGR                            0.88%
    Buy and hold                  -54.67%
  RISK
    Max drawdown                    8.24%
    Sharpe ratio                     0.24
  TRADES
    Closed trades                      32
    Win rate                        37.5%
    Profit factor                    1.43
```

---

## Read this before anything else

Backtests lie. Not usually because the arithmetic is wrong, but because the
person running them keeps adjusting parameters until the curve looks good, and
that curve is then fitted to history that will never repeat. This project is
built to make that failure mode visible rather than to hide it:

- Signals generated on bar *i* are filled at bar *i + 1*'s **open**. The engine
  structurally cannot trade on a price it has not yet seen.
- Two tests hunt for lookahead specifically, and both have been checked by
  deliberately reintroducing the bug to confirm they fail when they should.
- Commission and slippage are on by default. Turn them off and watch a losing
  strategy turn "profitable".
- `optimize` reports in sample and out of sample results side by side and ranks
  on the holdout, because the gap between those two columns is the whole story.

Run `optimize` once and you will see most parameter sets earn 30 to 50 percent
in sample and lose money out of sample. That is the honest baseline this exists
to teach.

**This is educational software. It is not investment advice.**

---

## Setup

No install step, no virtual environment, no packages.

```bash
cd trading-bot
python run.py --help
```

Python 3.9 or newer. That is the entire requirement list.

---

## Commands

| Command | What it does |
| --- | --- |
| `strategies` | List strategies and their parameters |
| `backtest` | Run a strategy over history and print a full report |
| `optimize` | Grid search parameters with an out of sample holdout |
| `signals` | Show what the strategy would do right now. Sends nothing |
| `paper` | Run one paper trading cycle against a simulated or Alpaca paper account |
| `fetch` | Download history to CSV so you can work offline |

### Backtest

```bash
python run.py backtest \
  --symbols AAPL,MSFT,NVDA \
  --start 2018-01-01 \
  --strategy sma_crossover --param fast=20 slow=100 \
  --cash 10000 --stop-loss 0.08 --max-drawdown 0.25 \
  --html reports/backtest.html
```

`--html` writes a self contained report with an SVG equity curve plotted
against equal weight buy and hold, plus the full trade table. It opens in any
browser and needs no internet connection.

### Optimize

```bash
python run.py optimize --symbols AAPL --strategy sma_crossover \
  --grid fast=5,10,20,50 slow=50,100,200 --split 0.7 --rank sharpe
```

```
  params                in ret  in shrp  out ret  out shrp   out dd  trades
  -------------------------------------------------------------------------
  fast=10, slow=50      41.4%     0.78     3.6%      0.26    3.9%      13
  fast=20, slow=50      51.6%     0.91    -4.6%     -0.31    8.7%      12
  fast=10, slow=100     26.1%     0.54    -8.8%     -0.63   10.3%      14
```

The second column is the fantasy. The fourth is the reality.

### Signals and paper trading

```bash
# What would it do today? Nothing is sent.
python run.py signals --symbols AAPL,MSFT --strategy macd_trend

# One simulated cycle, state saved between runs.
python run.py paper --symbols AAPL,MSFT --strategy macd_trend --state paper_state.json

# Same, but log the orders instead of filling them.
python run.py paper --symbols AAPL,MSFT --strategy macd_trend --dry-run
```

Run `paper` once a day after the close, by hand or from a scheduled task. The
JSON state file carries cash, positions, stops, and the halt flag across runs.

### Working offline

Market data providers rate limit and occasionally block. Cache history once:

```bash
python run.py fetch --symbols AAPL,MSFT --out data/
python run.py backtest --symbols AAPL,MSFT --provider csv --csv-dir data/
```

The `synthetic` provider generates seeded geometric Brownian motion and needs no
network at all. It is what the test suite runs on, and it is useful for checking
that a strategy is not just pattern matching one lucky history.

---

## Strategies

| Name | Idea |
| --- | --- |
| `sma_crossover` | Long while the fast moving average leads the slow one |
| `macd_trend` | Long when the MACD histogram turns positive above a long trend filter |
| `rsi_reversion` | Buy oversold dips inside an uptrend, sell into strength |
| `donchian_breakout` | Turtle style. Buy N day highs, exit on N day lows |
| `bollinger_reversion` | Buy below the lower band, exit at the middle band |
| `buy_and_hold` | The benchmark you have to beat. Most strategies do not |

### Writing your own

Subclass `Strategy`, precompute indicators once in `prepare`, answer one bar at
a time in `evaluate`, register it. Reading `bars[i]` is allowed. Reading
`bars[i + 1]` is the bug this whole design exists to prevent.

```python
from tradingbot import indicators as ind
from tradingbot.core import Action, Signal
from tradingbot.strategies import REGISTRY, Strategy


class MomentumStrategy(Strategy):
    """Long when 60 day momentum is positive."""

    name = "momentum"

    @classmethod
    def defaults(cls):
        return {"lookback": 60}

    @property
    def warmup(self):
        return self.params["lookback"] + 1

    def prepare(self, symbol, bars):
        self._state[symbol] = ind.roc([b.close for b in bars], self.params["lookback"])

    def evaluate(self, symbol, i, in_position):
        momentum = self._state[symbol][i]
        if momentum is None:
            return Signal(symbol, Action.HOLD)
        if not in_position and momentum > 0.05:
            return Signal(symbol, Action.ENTER_LONG, f"momentum {momentum:.1%}")
        if in_position and momentum < 0:
            return Signal(symbol, Action.EXIT_LONG, "momentum turned negative")
        return Signal(symbol, Action.HOLD)


REGISTRY[MomentumStrategy.name] = MomentumStrategy
```

---

## Risk management

The strategy decides *whether* to trade. `RiskManager` decides *how much*, and
holds the veto. Position sizing offers three modes:

- `fixed_fraction` a set percentage of equity per position
- `fixed_dollar` a flat notional per position
- `atr_risk` size so that a stop at `atr_stop_mult` ATRs costs exactly
  `risk_per_trade` of equity. This is the one worth learning, because it sizes
  down automatically when a stock gets volatile

On top of sizing:

| Flag | Effect |
| --- | --- |
| `--stop-loss 0.08` | Hard stop 8 percent below entry |
| `--trailing-stop 0.15` | Stop trails 15 percent below the highest close since entry |
| `--take-profit 0.20` | Fixed target |
| `--max-position-pct 0.25` | No position exceeds 25 percent of equity |
| `--max-positions 4` | At most four open at once |
| `--max-drawdown 0.20` | Kill switch. At 20 percent down, liquidate and stop |

Two deliberate choices in the exit logic. When a bar touches both the stop and
the target, the stop is assumed to have hit first. When price gaps straight
through a stop, the fill is the open, not the stop price. Both make backtests
worse and more honest.

---

## Alpaca paper trading

Optional. Get free paper keys at <https://alpaca.markets>, then:

```bash
export ALPACA_API_KEY_ID=your_key
export ALPACA_API_SECRET_KEY=your_secret
python run.py paper --symbols AAPL,MSFT --strategy macd_trend --broker alpaca
```

The client refuses any base URL that is not `https://paper-api.alpaca.markets`.
Pointing this at a live account is not a mistake you can make by accident, and
`.env` is in `.gitignore` so your keys do not end up on GitHub.

---

## Project layout

```
trading-bot/
├── run.py                  entry point
├── tradingbot/
│   ├── core.py             Bar, Order, Fill, Position, Trade, Signal
│   ├── indicators.py       SMA, EMA, RSI, MACD, ATR, Bollinger, Donchian
│   ├── data.py             CSV, Yahoo, Stooq, synthetic providers with caching
│   ├── strategies.py       strategy base class and the built in set
│   ├── portfolio.py        cash, positions, costs, equity curve
│   ├── risk.py             sizing, stops, kill switch
│   ├── engine.py           the backtest loop
│   ├── metrics.py          CAGR, Sharpe, Sortino, drawdown, trade stats
│   ├── broker.py           PaperBroker and AlpacaPaperBroker
│   ├── live.py             paper trading loop with saved state
│   ├── report.py           terminal and HTML reports
│   └── cli.py              argument parsing
└── tests/                  171 tests
```

---

## Tests

```bash
python -m unittest discover -s tests -t .
```

```
Ran 171 tests in 2.7s
OK
```

The two that matter most live in `tests/test_engine.py`:

- `test_the_engine_only_offers_the_current_bar` records every bar index the
  engine hands the strategy and asserts it never runs ahead of the bar being
  processed.
- `test_truncating_the_future_does_not_change_past_decisions` runs the same
  strategy over a full history and over a prefix of it. If any indicator reads
  beyond its own index, the trades in the overlapping period diverge.

Both were verified by mutation: the lookahead bugs they target were
reintroduced on purpose, and both tests failed as designed before the bugs were
reverted.

---

## What this will not do

It will not make money on its own. Every strategy here is public, decades old,
and already priced in by people with faster data and lower costs than you have.

What it is good for is learning how the machinery fits together: how execution
timing changes results, why costs matter more than entry rules, what position
sizing actually does to a drawdown, and how convincingly an overfitted backtest
can lie. Those lessons transfer. The strategies do not.
