# Trading Bot

Backtesting engine, robustness analysis, risk management, and automated paper
or live trading. Pure Python, **zero third party dependencies**, 302 tests.

Runs on the Python that ships with macOS. Nothing to install.

```
$ cd trading-bot
$ python3 run.py backtest --symbols AAPL,MSFT --strategy macd_trend

====================================================================
  macd_trend(fast=12, signal=9, slow=26, trend_filter=200)
  AAPL, MSFT   2019-01-01 to 2024-12-31
====================================================================

  ▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▂▃▂▁▂▄▅▄▅▆▅▆█▆▆▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
  $10,000.00                                            $10,540.59

  RETURNS                          RISK
    Total return       5.41%         Max drawdown      8.24%
    CAGR               0.88%         Sharpe ratio       0.24
    Buy and hold     -54.67%         Win rate          37.5%
```

---

## Read this first

Backtests lie. Rarely because the arithmetic is wrong, usually because the
person running them keeps adjusting parameters until the curve looks good, and
that curve is fitted to history that will never repeat. This project is built
to expose that failure mode rather than hide it.

- Signals from bar *i* are filled at bar *i + 1*'s **open**. The engine
  structurally cannot trade on a price it has not yet seen.
- Two tests hunt for lookahead specifically, and both are verified by
  deliberately reintroducing the bug to confirm they fail when they should.
- Commission, slippage, and short borrow costs are modelled and on by default.
- `walkforward` refits on a rolling window and scores only the untouched window
  that follows.
- `montecarlo` resamples your trades to show how much of the result was luck.

Run `walkforward` once. You will typically see a strategy that looked excellent
in a single backtest turn in a sub 50 percent hit rate across folds, with its
"best" parameters jumping around every window. That is what curve fitting looks
like from the outside, and seeing it is the point of this project.

**Educational software. Not investment advice.**

---

## Setup

```bash
cd trading-bot
python3 run.py --help
```

Python 3.9 or newer, which macOS already has at `/usr/bin/python3`. That is the
entire requirement list.

---

## Commands

| Command | What it does |
| --- | --- |
| `strategies` | List strategies and their parameters |
| `backtest` | Run a strategy over history, print a report, optionally write HTML |
| `optimize` | Grid search with a single out of sample holdout |
| `walkforward` | Rolling refit, scored only on windows never used for fitting |
| `montecarlo` | Resample the trades to size the role of luck |
| `signals` | Show what the strategy would do right now. Sends nothing |
| `paper` | Run one trading cycle |
| `run` | Run continuously on a schedule until stopped |
| `status` | Market status, saved positions, journal summary |
| `fetch` | Download history to CSV for offline work |
| `init-config` | Write a starter config file |
| `pine` | Export the strategies as TradingView Pine Script |

### Backtest

```bash
python3 run.py backtest \
  --symbols AAPL,MSFT,NVDA \
  --start 2018-01-01 \
  --strategy sma_crossover --param fast=20 slow=100 \
  --cash 10000 --stop-loss 0.08 --max-drawdown 0.25 \
  --html reports/backtest.html
```

`--html` writes a self contained report with an SVG equity curve plotted
against equal weight buy and hold, plus the full trade table. No internet
needed to view it.

### Walk forward, the honest test

```bash
python3 run.py walkforward --symbols AAPL,MSFT \
  --strategy sma_crossover --grid fast=10,20,50 slow=50,100,200 \
  --train-days 504 --test-days 126
```

```
  Compounded out of sample return       21.21%
  Median fold                           -0.88%
  Worst fold                            -5.59%
  Profitable folds                  11/27  (41%)
  Parameter stability                      59%
```

Consistency under 50 percent means the strategy is not reliably profitable.
Parameter stability under 50 percent means the best settings keep moving.

### Monte Carlo, sizing the role of luck

```bash
python3 run.py montecarlo --symbols AAPL,MSFT --strategy macd_trend --trials 2000
```

```
  Actual backtest return                 3.37%
  Actual backtest drawdown               9.59%

  Median resampled return               -4.05%
  5th percentile                       -69.53%
  95th percentile                      228.91%
  Probability of losing money            52.5%
  95th percentile drawdown              78.68%
```

That backtest's tidy 9.6 percent drawdown sits inside a distribution whose 95th
percentile is 79 percent. Size for the distribution, not for the one path you
happened to observe.

Two methods. `bootstrap` resamples trades with replacement, so both return and
drawdown vary. `shuffle` only reorders the observed trades, and because
compounding is commutative every shuffle ends at the identical equity by
construction, which makes it informative about drawdown and nothing else.

### Signals, paper, and scheduled runs

```bash
# What would it do today? Nothing is sent.
python3 run.py signals --symbols AAPL,MSFT --strategy macd_trend

# One simulated cycle, state saved between runs.
python3 run.py paper --config config.json

# Run continuously, deciding 10 minutes before each close.
python3 run.py run --config config.json --schedule daily --minutes-before-close 10
```

The scheduler knows the US market calendar, so it sleeps through weekends,
holidays, and early closes without waking the data provider.

### Config files

```bash
python3 run.py init-config          # writes config.json
python3 run.py backtest --config config.json
```

Precedence is defaults, then the config file, then explicit flags. A setting the
loader does not recognise is a hard error, because a silent typo in a risk limit
is exactly the kind of quiet failure that costs money.

### Working offline

```bash
python3 run.py fetch --symbols AAPL,MSFT --out data/
python3 run.py backtest --symbols AAPL,MSFT --provider csv --csv-dir data/
```

Providers: `yahoo` (default, no key), `stooq`, `alpaca`, `tiingo`, `finnhub`,
`csv`, and `synthetic`. The synthetic provider generates seeded geometric
Brownian motion and needs no network at all. It is what the test suite runs on,
and it is a good check that a strategy is not just pattern matching one lucky
history.

Intraday bars via `--interval 1h|30m|15m|5m|1m` on `yahoo` and `alpaca`.

---

## Strategies

| Name | Idea |
| --- | --- |
| `sma_crossover` | Long while the fast moving average leads the slow one |
| `macd_trend` | MACD histogram sign, filtered by a long term trend |
| `rsi_reversion` | Buy oversold dips in an uptrend, fade overbought in a downtrend |
| `donchian_breakout` | Turtle style. Buy N day highs, exit or reverse on N day lows |
| `bollinger_reversion` | Fade the bands, exit at the mean |
| `buy_and_hold` | The benchmark you have to beat. Most strategies do not |

Every strategy takes `--direction long|short|both`.

### Writing your own

A strategy answers one question per bar: what stance should we hold? Return
`+1` for bullish, `-1` for bearish, `0` for flat, or `None` for no opinion. The
base class turns that into orders, so every rule is symmetrical for free and
cannot accidentally short while running long only.

```python
from tradingbot import indicators as ind
from tradingbot.strategies import REGISTRY, Strategy


class MomentumStrategy(Strategy):
    """Long when 60 day momentum is positive."""

    name = "momentum"

    @classmethod
    def defaults(cls):
        return {"lookback": 60, "threshold": 0.05}

    @property
    def warmup(self):
        return self.params["lookback"] + 1

    def prepare(self, symbol, bars):
        self._state[symbol] = ind.roc([b.close for b in bars], self.params["lookback"])

    def stance(self, symbol, i):
        momentum = self._state[symbol][i]
        if momentum is None:
            return None
        if momentum > self.params["threshold"]:
            return 1
        return -1 if momentum < 0 else 0

    def reason(self, symbol, i, target):
        return f"momentum {self._state[symbol][i]:.1%}"


REGISTRY[MomentumStrategy.name] = MomentumStrategy
```

Reading `bars[i]` is allowed. Reading `bars[i + 1]` is the bug this whole design
exists to prevent.

---

## Risk management

The strategy decides *whether* to trade. `RiskManager` decides *how much*, and
holds the veto.

Sizing modes:

- `fixed_fraction` a set percentage of equity per position
- `fixed_dollar` a flat notional per position
- `atr_risk` size so a stop at `atr_stop_mult` ATRs costs exactly
  `risk_per_trade` of equity. This is the one worth learning, because it sizes
  down automatically when a stock gets volatile

| Flag | Effect |
| --- | --- |
| `--stop-loss 0.08` | Hard stop 8 percent against the position |
| `--trailing-stop 0.15` | Trails the best price seen since entry |
| `--take-profit 0.20` | Fixed target |
| `--max-position-pct 0.25` | No position exceeds 25 percent of equity |
| `--max-positions 4` | At most four open at once |
| `--max-gross-exposure 1.0` | Total exposure cap. 1.0 means no leverage |
| `--max-drawdown 0.20` | Kill switch. At 20 percent down, liquidate and stop |

Two deliberate choices in the exit logic: when a bar touches both the stop and
the target, the stop is assumed to have hit first, and when price gaps through a
stop the fill is the open rather than the stop price. Both make results worse
and more honest. Shorts mirror all of it, with the stop above the entry and the
trailing stop following the lowest price seen.

### Short selling

Off by default. `--allow-short` enables it, and the accounting is signed
throughout: a short credits cash, the position carries a negative quantity, and
equity is always `cash + sum(qty * price)`. `--borrow-rate` charges a daily
borrow cost on open shorts.

A short's loss is unbounded. `--max-gross-exposure` is what keeps that from
being theoretical.

---

## Live trading

**Live mode sends real orders against real money.** It is deliberately awkward
to reach and requires all three of:

1. `--broker alpaca-live` on the command line
2. `TRADINGBOT_ALLOW_LIVE=yes` in the environment
3. `--confirm "TRADE REAL MONEY"`, the exact phrase

Two further circuit breakers apply in live mode only: `--max-order-notional`
caps any single order (default $1,000) and `--max-daily-orders` caps how many
orders can be sent in a day (default 20). A strategy bug cannot empty the
account in one afternoon.

```bash
export ALPACA_API_KEY_ID=your_key
export ALPACA_API_SECRET_KEY=your_secret

# Paper first. Always paper first.
python3 run.py paper --config config.json --broker alpaca

# Live, once you have paper traded it for months and understand the numbers.
export TRADINGBOT_ALLOW_LIVE=yes
python3 run.py paper --config config.json --broker alpaca-live \
  --confirm "TRADE REAL MONEY" --max-order-notional 200
```

Before you consider this seriously:

- Under $25,000 you are a pattern day trader. Four day trades in five business
  days and your account gets restricted. Daily bar strategies mostly avoid this;
  intraday ones will not.
- Live entries are sent as bracket orders, so the stop lives at the broker and
  still protects the position if this process dies.
- Every order is written to `journal.csv` before it is sent.
- `.env`, `config.json`, and `journal.csv` are all gitignored.

Get free paper keys at <https://alpaca.markets>.

---

## TradingView

TradingView cannot run this Python package, so the strategies are exported as
native Pine Script v6 instead.

```bash
python3 run.py pine --out pine/
```

Then in TradingView: open a chart, click **Pine Editor** at the bottom, open a
new blank strategy, delete the placeholder code, paste a `.pine` file, click
**Save**, then **Add to chart**. Results appear in the **Strategy Tester** tab.

The Pine versions mirror the Python ones: same rules, same defaults, same risk
block, and the same execution timing, since Pine with
`process_orders_on_close=false` also fills at the next bar's open.

They will not match to the cent. TradingView uses its own data, dividend
adjustment, and intrabar fill assumptions, and a free account limits how much
history the Strategy Tester covers. Treat a large divergence as a question worth
asking, not proof that either side is wrong.

Set the chart to **Daily** before judging any of them. These are daily bar
strategies; running them on a 5 minute chart tests something else entirely.

---

## Running it unattended on macOS

```bash
python3 run.py init-config      # then edit config.json
./macos/install-agent.sh
```

That installs a `launchd` agent running one cycle each weekday afternoon. The
schedule in the plist is **local** time, so adjust it if you are not in US
Central. The bot checks the market calendar itself, so it does nothing on
holidays regardless.

```bash
launchctl list | grep tradingbot          # status
tail -f logs/launchd.out                  # logs
launchctl unload ~/Library/LaunchAgents/com.tradingbot.daily.plist   # stop
```

Notifications on fills, if you want them:

```bash
export TRADINGBOT_WEBHOOK=https://hooks.slack.com/services/...
# or SMTP, with an app password rather than your account password
export TRADINGBOT_SMTP_HOST=smtp.gmail.com
export TRADINGBOT_SMTP_USER=you@gmail.com
export TRADINGBOT_SMTP_PASSWORD=your_app_password
python3 run.py run --config config.json --notify-email you@gmail.com
```

---

## Project layout

```
trading-bot/
├── run.py                  entry point
├── tradingbot/
│   ├── core.py             Bar, Order, Fill, Position, Trade, Signal
│   ├── indicators.py       SMA, EMA, RSI, MACD, ATR, Bollinger, Donchian
│   ├── data.py             csv, yahoo, stooq, alpaca, tiingo, finnhub, synthetic
│   ├── market_calendar.py  US holidays, half days, session hours, Eastern time
│   ├── strategies.py       stance based strategy framework and the built in set
│   ├── portfolio.py        signed positions, costs, borrow, equity curve
│   ├── risk.py             sizing, stops, exposure caps, kill switch
│   ├── engine.py           the backtest loop
│   ├── metrics.py          CAGR, Sharpe, Sortino, drawdown, trade stats
│   ├── analysis.py         walk forward, Monte Carlo, parameter surface
│   ├── broker.py           PaperBroker and the gated Alpaca client
│   ├── live.py             trading loop with saved state and journalling
│   ├── scheduler.py        market aware daemon
│   ├── journal.py          append only audit trail
│   ├── notify.py           webhook and email alerts
│   ├── config.py           JSON config with strict validation
│   ├── report.py           terminal and HTML reports
│   ├── pine.py             TradingView Pine Script export
│   └── cli.py              argument parsing
├── macos/                  launchd agent and installer
└── tests/                  302 tests
```

---

## Tests

```bash
python3 -m unittest discover -s tests -t .
```

```
Ran 302 tests in 11s
OK
```

The ones that matter most live in `tests/test_engine.py`:

- `test_the_engine_only_offers_the_current_bar` records every bar index the
  engine hands the strategy and asserts it never runs ahead of the bar being
  processed. This catches engine level lookahead.
- `test_truncating_the_future_does_not_change_past_decisions` runs the same
  strategy over a full history and over a prefix of it. This catches indicator
  level lookahead.

Both were verified by mutation. The bugs they target were reintroduced on
purpose and each test failed as designed before the mutation was reverted. The
first test exists because the truncation test alone did **not** catch engine
level lookahead, which is exactly the kind of gap a test suite you have never
watched fail will hide from you.

`test_portfolio.py` carries the accounting invariant that trade P&L must
reconcile to the cent with the change in portfolio equity, for longs and shorts
alike. That one caught a real double counting bug during development.

---

## What this will not do

It will not make money on its own. Every strategy here is public, decades old,
and already priced in by desks with faster data, lower costs, and more capital
than you have.

What it is good for is learning how the machinery fits together: how execution
timing changes results, why costs matter more than entry rules, what position
sizing does to a drawdown, how a walk forward test dismantles a backtest that
looked excellent, and how convincingly an overfitted curve can lie. Those
lessons transfer. The strategies do not.
