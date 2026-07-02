Codebase & Logic Analysis: /Users/amitraj/NSE data online
This document details the code structure, execution logics, data models, and analytics procedures in the /Users/amitraj/NSE data online project.

1. Directory Structure & Key Files
The folder is a workspace for intraday option analytics, strategy backtesting, pattern detection, and live order simulation on NSE (National Stock Exchange of India) derivatives:

Primary Python Scripts:
Live_market_N50_ATM_OHLC_working.py - Fetches options data (LTP, OI, IV, Delta, Theta) dynamically and builds 30-sec candles.
Live_create_OHLC_strike.py - Resamples raw LTP data into 1-minute candles.
Live_N50_option_LTP_feed.py - Tracks tick-by-tick option feeds (simulated/mock or live).
my_2026_lswing_low_logic.py & test_improved_swing_low.py - Core implementation and multi-strike backtesting for the 5-candle pivot-based Swing Low strategy.
EMA_9_50_logic_backtest.py - Vectorized EMA crossover and swing backtester.
logic_pattern_finder.py - Detects patterns (EMA cross, swing low, average price movement) inside CSV tick datasets.
Reference & Educational Guides:
summaryof_project.md - High-level architectural overview of a live NIFTY options strategy engine.
help.text - Complete playbook for Options Super Orders, risk parameters, and data flow.
help_live_trad_code.txt - Step-by-step code and logical breakdown of the trailing stop loss logic.
Support_Resistance_Breakout/Help_Support_Resistance_Breakout.text - Analytical study of breakout success rate.
Volatility_Direction_Study/help_Volatility_DirectionStudy.text - Study on volatility expansion and follow-through.
2. Database Schema & Architecture
The workspace relies on four SQLite database files:

A. Live_n50_final.db
This database records real-time index feeds, options chains, trading signals, and executions:

live_nifty_LTP_feed_master: Stores tick history for the Nifty 50 index spot.
Columns: id, date, time, symbol, ltp, timestamp, volume
live_option_LTP_feed_master: Raw option chain tick data.
Columns: id, symbol, date, time, expiry_date, strike_price, option_type, ltp, delta, bid_price, ask_price, volume, open_interest, oi_change, implied_volatility, timestamp
ohlc_strike_master: Minute OHLC bar cache constructed from live_option_LTP_feed_master.
Columns: id, symbol, expiry_date, strike_price, option_type, date, time, timeframe, open_price, high_price, low_price, close_price, volume, open_interest
alert_signal_data: Tracks generated trading signals.
Columns: alert_id, alert_timestamp, symbol, strike_price, option_type, signal_type, signal_direction, volatility_state, signal_price, suggested_stop_loss, suggested_target, risk_reward_ratio
trade_execution_log: Logs simulated execution performance.
Columns: trade_id, alert_id, entry_price, exit_price, quantity, gross_pnl, charges, net_pnl, exit_reason
B. nifty_option_data.db
A lightweight database storing feeds and pattern alerts:

live_option_feed: id, index_name, strike, option_type, ltp, date, time, timestamp
options_pattern_alerts: id, index_name, strike, option_type, entry_price, stop_loss, target, alert_date, alert_time
C. NSE_Analysis.db
A large database (approx. 39MB) hosting historical index prices and tables for historical backtesting:

Nifty50_historical_ohlc: Columns: Serial No, Symbol Name, Date, Time, Open, High, Low, Close, Volume
index_master_strike_ID_list: Maps options contracts to security IDs for fast lookup.
Columns: id, index_name, strike, option_type, expiry, security_ID, exchange_segment
BANKNIFTY_Strike_CE_Expiry tables: Specific tables tracking historical price points (e.g. BANKNIFTY_58500_CE_2026_01_27).
3. Core Trading Logics & Strategies
A. The 5-Candle Swing Low Strategy
Found in my_2026_lswing_low_logic.py and test_improved_swing_low.py:

Resampling: Tick prices are grouped into 3-minute candles.
Pivot Pivot Detection:
A pivot low is identified if C3.low < C2.low and C3.low < C4.low (where C3 is the middle candle).
A recovery is confirmed if C5.close > C4.close > C3.close.
Quality Filter: Candles must have a solid body: (Body / Range) > 0.4 to avoid noisy or flat candles.
Execution:
Entry: Buy Call (CE) or Put (PE) at the open of the next candle.
Stop-Loss (SL): Set at the swing low (C3.low).
Target: Entry price + 5 points.
Time Exit: If target or SL is not hit within 10 candles (30 minutes), exit at the market close price.
B. EMA 9/50 Crossover Strategy
Implemented in EMA_9_50_logic_backtest.py and logic_pattern_finder.py:

EMA calculation: Compute Exponential Moving Averages for 9 and 50 periods.
Bullish Crossover:
EMA(9) > EMA(50) on the current candle, whereas EMA(9) <= EMA(50) on the previous candle.
Swing Low Confirmation:
Current candle low is greater than previous candle low, which is less than the low of two candles ago (Low[i-2] > Low[i-1] and Low[i-1] < Low[i]).
Midpoint body trend:
Averages of opens and closes are increasing: Avg[i-2] < Avg[i-1] < Avg[i].
Outcome: Generates a BUY alert on convergence of all three conditions, aiming for a 20-point target with risk capped.
C. Support/Resistance & Volatility Analysis
Detailed in Support_Resistance_Breakout and Volatility_Direction_Study:

Resistance: Defined as rolling highest High of the past 20 candles. A breakout occurs if Close > Resistance. It is considered successful if price moves +0.5% within the next 5 candles.
Support: Defined as rolling lowest Low of the past 20 candles. A breakdown occurs if Close < Support.
Volatility Impact: The average range (High - Low) of candles is used to classify candles as "High Volatility" or "Low Volatility". Backtests show that High Volatility candles exhibit significantly stronger follow-through in the same direction on the next candle compared to Low Volatility ones.
4. Live API Polling & Trailing SL Logics
Super Orders: Integrated via Dhan APIs. Employs Bracket/OCO (One-Cancels-the-Other) logic where target price and stop-loss leg are submitted simultaneously to the broker's system.
Trailing Stop-Loss:
If price goes up by +2 points above entry, trailing SL moves to entry (break-even).
If price goes up by +3 points above entry, trailing SL moves to entry + 1 point.



## 📁 Project Structure

- **[myproject/](file:///Users/amitraj/finalProject/level-2%20start/myproject)**: Main Django project folder (ASGI, WSGI, URLs, Settings).
- **[trading/](file:///Users/amitraj/finalProject/level-2%20start/trading)**: The primary application containing models, views, forms, serializers, and templates.
- **[algo_file_py/](file:///Users/amitraj/finalProject/level-2%20start/algo_file_py)**: Intraday gap analysis and automated entry scripts.
- **[order_related_files/](file:///Users/amitraj/finalProject/level-2%20start/order_related_files)**: Implementation of live swing trading pipelines, trade state trackers, and live PnL dashboards.
- **[HELP_read/](file:///Users/amitraj/finalProject/level-2%20start/HELP_read)**: Guides detailing database design rules, backtesting framework setups, and live testing instructions.

---

## 🗄 Database Design & Schema

The application manages index and option data using several SQLite databases (`db.sqlite3`, `dhan_instruments.sqlite3`, and `oldDataBase.sqlite3`). Key tables include:

### 1. Master & Configurations
* **`DhanCredential`**: Stores encrypted/secure API client keys and session access tokens.
* **`UserProfile`**: Tracks user account margins and balances.
* **`IndexMasterStrikeIDList` & `LiveInstrumentMaster`**: Maps underlying spot strikes and expiries to specific Dhan exchange security IDs.

### 2. Market Data Cache
* **`Nifty50IntradayOHLC` & `SensexIntradayOHLC` & `BankniftyIntradayOHLC`**: 1-minute historical data for index backtesting.
* **`LiveOptionChain` & `LiveTick`**: High-frequency ticks and snapshots of implied volatilities (IV), open interest (OI), and delta metrics.

### 3. Loggers & Audits
* **`Order` & `Position`**: Audits broker order responses, status updates (FILLED, CANCELLED), and active exposure.
* **`PerformanceLog` & `Log`**: Tracks strategy drawdown stats and system errors.

---

## 📈 Implemented Strategies

### A. Pivot-based Swing High/Low Strategy
* **Logic**: Resamples prices into 3-minute candles. Detects a local pivot low when a candle's low is lower than both the preceding and following candle lows.
* **Execution**: Buys CE at the open of the next candle after a swing low is confirmed, and PE after a swing high is confirmed.
* **Exit**: Trailing stop loss logic trails 1 point behind the entry once the target moves +3 points in favor.

### B. Gap Analysis Strategy
* **Logic**: Measures the opening gap size between the index closing price at 3:28 PM and the next day's open at 9:15 AM.
* **Classification**: Classifies moves under 50 points as "Loss Zone" (ranging market), and moves above 100 points as "Big Profit" (high-volatility trend continuation). Calculates target prices dynamically using ATR indicators.

---

## 🧪 Backtesting Framework

The file `backtest_framework.py` provides an evaluation suite:
1. Loads 1-minute historical candles from `Nifty50IntradayOHLC` or stock records in `CompanyIntradayOHLC`.
2. Runs the strategy simulator candle-by-candle.
3. Computes win rates, net profit/losses, drawdowns, and outputs detailed tabular logs.
