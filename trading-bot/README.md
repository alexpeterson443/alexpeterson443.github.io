# Trading Bot

Backtesting engine, robustness analysis, risk management, automated paper or
live trading, and a Polymarket prediction market toolkit. Pure Python,
**zero third party dependencies**, 430 tests.

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
| `pm` | Polymarket tools: markets, books, arbitrage, Kelly sizing, paper trading |

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

## Polymarket

The same machinery, pointed at binary prediction markets. A share pays exactly
$1 if the outcome happens and $0 if it does not, so its price is a probability.

```bash
python3 run.py pm models                                   # probability models
python3 run.py pm markets --search "fed" --limit 20        # find markets
python3 run.py pm book --slug some-market-slug             # book and slippage curve
python3 run.py pm arb --pages 2                            # scan for YES+NO under $1
python3 run.py pm scan --model longshot_fade --bankroll 500
python3 run.py pm paper --model fixed --param probability=0.7 --slug some-slug
python3 run.py pm status
```

No API key is needed for any of the reads. The public Gamma, CLOB, and Data
endpoints are all reachable without authentication.

### Three things that differ from equities

**Loss is bounded.** A share cannot fall below zero, so the most a position can
lose is its stake. That makes Kelly sizing genuinely well defined here:

    f* = (p - c) / (1 - c)

where `c` is the price and `p` is your probability. `sizing.py` implements it
and defaults to a quarter of full Kelly, because full Kelly is optimal only if
your `p` is exactly right, and it never is.

**YES and NO are complements.** One of each pays exactly $1 at resolution, so if
both can be bought for less than a dollar the profit is locked in with no view
on the outcome. `pm arb` walks both ask books in lockstep and takes every
profitable pair, stopping at the exact size where the edge runs out.

**Capital is trapped until resolution.** A 2 percent edge resolving in a week
annualises to 187 percent. The same 2 percent locked up for two years is 1
percent, which is worse than doing nothing. Every arbitrage result is reported
annualised for this reason.

### What the scanners actually found

Run against 120 live markets, `pm arb` found **zero** opportunities. Measuring
the distribution explains why:

```
best-ask YES + best-ask NO across 55 live markets
  min    1.0010     <- exactly one tick above a dollar
  median 1.0070
  below 1.00 (true arbitrage): 0
```

Every market is priced at or above a dollar, and the tightest is exactly one
tick wide. Market makers hold that line and automated traders close anything
wider within milliseconds. The scanner works; the opportunity does not exist.

`pm scan` with the longshot fade model found zero candidates too, and prints
why each market was rejected rather than leaving you guessing:

```
  no_opinion       23      model had no view at these prices
  no_quote          4      no ask side
  sized_to_zero    28      price outside the tradeable band
```

The worked example is the useful part. A market with YES at 0.006, shaded 25
percent by the model, gives a true estimate of 0.0041. That is a shade of
**0.0019** on the YES side. On the NO side, where you would actually place the
bet, NO trades at 0.995 against an implied 0.9959, so the edge is **+0.0009** —
nine hundredths of a cent, against a spread of one full tick.

The favourite longshot bias is real and well documented. It is also, at these
prices, smaller than the spread. That is worth understanding before assuming a
documented market anomaly is a tradeable one.

### Depth aware execution

The most common way a prediction market strategy lies to itself is assuming it
fills at the quoted price. `pm book` walks the real book and shows what a given
size actually costs:

```
Will Arsenal FC win on 2026-08-31?
  Yes  bid 0.55  ask 0.56  spread 0.01  mid 0.555
       depth within 5c: 154,548 shares ($89,440)
           size    filled   avg price   slippage  levels
             25        25      0.5600    +0.0000       1
            500       500      0.5600    +0.0000       1
           2000      2000      0.5625    +0.0025       2
          10000     10000      0.5685    +0.0085       2
```

`trader.py` runs every candidate through that walk and rejects it if slippage
eats the edge. On a contract that pays at most a dollar, a cent of slippage is
enormous.

### Probability models

| Model | Claim |
| --- | --- |
| `market_price` | The null model. Believes the market, so its edge is zero by construction |
| `longshot_fade` | Fades the favourite longshot bias at the extremes |
| `momentum` | Recent drift in the odds continues |
| `reversion` | A sharp move gives part of itself back |
| `fixed` | Your own researched number, sized properly with Kelly |

`market_price` exists to be beaten. Compare anything you write against it; most
models lose. `momentum` and `reversion` cannot both be right about the same
series, which is stated plainly rather than hidden behind two nice backtests.

### Where the real question lives

Everything in this package except `models.py` is mechanics. To profit you must
believe a probability differs from its price, and that belief is the entire
edge. Sizing, execution, and risk control are all downstream of one number you
have to supply. Returning "no opinion" is the correct answer far more often
than people expect, which is why every model is allowed to.

### The 5 minute Bitcoin snipe

A strategy pitch was supplied for Polymarket's five minute "Bitcoin Up or
Down" markets: in the final minute the outcome is nearly decided, so buy the
leader at 85 to 92 cents and collect the rest. High win rate, small profit.

`pm snipe` implements it exactly as pitched, then does the arithmetic the
pitch skipped.

```bash
python3 run.py pm snipe math      # break even and expectancy with real fees
python3 run.py pm snipe now       # evaluate the live window, every gate shown
python3 run.py pm snipe watch     # record live windows to CSV until stopped
python3 run.py pm snipe report    # observed win rate at each entry price
```

Three facts, each verified against the live market rather than assumed:

**The fee.** `fee = shares x 0.07 x p x (1 - p)`, taker only. About 0.9 cents a
share at 85 cents, six percent of the gross margin.

**The resolution.** A Chainlink TWAP with a lookback read from each market's
own config (60 seconds on every window inspected), compared to a TWAP at the
open. The spot price at the buzzer does not decide it, and the final fifteen
seconds carry a quarter of the weight rather than all of it. `pm snipe`
tracks the running TWAP against the open, not spot against a strike.

**The break even.** Buying at price `c` needs a win rate of at least `c`. The
pitch claims 10 of 12 and requires 85 cents and above:

```
   entry  fee/share  breakeven  wins/loss   EV/share  verdict
    0.75     0.0131      76.3%       3.22    +0.0702  profitable
    0.80     0.0112      81.1%       4.30    +0.0221  profitable
    0.85     0.0089      85.9%       6.09    -0.0256  LOSES
    0.92     0.0052      92.5%      12.36    -0.0918  LOSES
```

The pitch's $48 a day is the 0.75 row. Its own rules forbid buying there. At
its own win rate, every price its ladder accepts has negative expectancy.

**What the live book showed.** At T-100s one window had Up bid 0.99 and no
asks at all. At T-68s another had Down at 0.96/0.98. When the outcome is
clear the price is 96 to 99 cents, not 85; when it is 85, the outcome is not
clear. The 15 cent margin the pitch describes is the market being uncertain,
and it prices that uncertainty correctly.

**What cannot be backtested.** Gamma drops resolved five minute windows within
minutes; one of the previous seventy two was still there. So the recorder
watches forward instead: every few seconds inside the final ninety, it logs
both books, spot, the running TWAP, the ATR, and the rule engine's verdict,
then logs how the window resolved. Join the two and you have the win rate at
every entry price, measured. The pitch asserted 83.3 percent and measured
nothing.

One live window, recorded end to end with the fixed loop: the leader offered
at 97 to 98 cents from T-89s to T-69s, the ask was pulled at T-63s and never
returned, and the distance rule was first satisfied at T-3s with nothing to
buy. Inside the ladder's active window there was not a single purchasable
observation. The window resolved as the leader.

Fifty windows is a start. Five hundred is an answer.

No orders are placed. Every gate in the pitch's checklist is kept, including
its own contradictory 0.80 ceiling from the second tab, so a skipped trade
always says exactly why.

### Legality

Polymarket US operates as a CFTC registered exchange, but at least eleven
states have issued cease and desist orders and the federal government sued
several of them in April 2026 to overturn those actions. **Illinois is one of
them, and that litigation is unresolved.** Whether federal registration
preempts state law is exactly what is being argued.

This package reads public market data and simulates trades. It does not sign
orders, does not want a wallet private key, and has no live execution path.

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
│   ├── cli.py              argument parsing
│   └── polymarket/         prediction markets
│       ├── api.py          Gamma, CLOB, and Data API client
│       ├── types.py        Market, OrderBook, Fill
│       ├── book.py         depth aware fills and slippage curves
│       ├── sizing.py       Kelly for bounded loss bets
│       ├── arbitrage.py    YES plus NO pair arbitrage
│       ├── models.py       probability models
│       ├── trader.py       model to sized candidate
│       ├── paper.py        binary outcome paper book
│       ├── sniper.py       5 minute BTC up/down: rules, fees, recorder
│       └── cli.py          the pm subcommands
├── macos/                  launchd agent and installer
└── tests/                  430 tests
```

---

## Tests

```bash
python3 -m unittest discover -s tests -t .
```

```
Ran 430 tests in 12s
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
