---
name: sol-token-guard1
description: "Comprehensive Solana token safety analysis — security scan, holder distribution, and risk scoring"
version: "1.0.0"
author: "ganlinux"
tags:
  - solana
  - security
  - token
  - analytics
  - risk
---

# Sol Token Guard

## Overview

This skill performs a comprehensive safety analysis on any Solana token. It combines security scanning, holder distribution analysis, and token metadata to produce a composite risk score with actionable recommendations. Use it before buying any token to avoid honeypots, rug pulls, and high-risk holdings.

## Pre-flight Checks

1. The `onchainos` CLI is installed and authenticated
2. Network connectivity is available
3. User has provided a valid Solana token address (base58 format, 32-44 characters) or a token name/symbol to search

## Commands

### Step 1: Resolve Token Address (if needed)

If the user provides a token name/symbol instead of an address:

```bash
onchainos token search --query <TOKEN_NAME> --chain solana
```

**When to use**: User says "check BONK" instead of providing an address.
**Output**: List of matching tokens with addresses. Pick the one with the highest liquidity/volume.

### Step 2: Token Basic Info

```bash
onchainos token info --address <TOKEN_ADDRESS> --chain solana
```

**When to use**: Always — this is the first data point.
**Output**: Token name, symbol, total supply, market cap, liquidity, creation date.
**Key signals**:
- Creation date < 24h → elevated risk
- Liquidity < $10k → high risk
- No social links or website → suspicious

### Step 3: Security Scan

```bash
onchainos security token-scan --address <TOKEN_ADDRESS> --chain solana
```

**When to use**: Always — core safety check.
**Output**: Honeypot risk, contract risk flags, mint authority status, freeze authority status.
**Key signals**:
- Honeypot detected → **CRITICAL**, stop immediately and warn user
- Mint authority enabled → risk of unlimited supply inflation
- Freeze authority enabled → risk of account freezing

### Step 4: Holder Distribution

```bash
onchainos token holder --address <TOKEN_ADDRESS> --chain solana
```

**When to use**: Always — detects concentration risk.
**Output**: Top holder percentages, whale concentration, bundler %, sniper %, new wallet %.
**Key signals**:
- Top 10 holders > 50% → high concentration risk
- Bundler % > 10% → possible coordinated manipulation
- Sniper % > 15% → likely insider/bot activity
- New wallet % > 30% → suspicious fresh wallet accumulation

### Step 5: Top Traders Check (Optional)

```bash
onchainos token top-trader --address <TOKEN_ADDRESS> --chain solana
```

**When to use**: Optional — provides additional context on who is trading.
**Output**: Top profit addresses, buy/sell ratio, trade volume.
**Key signals**:
- If top traders are all selling → bearish signal
- If only a few wallets dominate volume → low organic interest

## Risk Scoring

After collecting all data, calculate a composite risk score:

| Risk Level | Criteria | Recommendation |
|------------|----------|----------------|
| **Critical** | Honeypot detected OR mint authority + freeze authority both enabled | Do NOT buy. Warn user immediately. |
| **High** | Top 10 holders > 50% OR bundler > 10% OR liquidity < $10k OR created < 24h ago | Strongly advise against buying. |
| **Medium** | Top 10 holders 30-50% OR sniper > 15% OR no website/socials | Proceed with caution, small position only. |
| **Low** | None of the above flags triggered | Relatively safer, but always DYOR. |

### Response Format

Present results to the user in this structure:

```
Token: <name> (<symbol>)
Address: <address>
Market Cap: <value> | Liquidity: <value> | Age: <value>

Security Scan:
- Honeypot: Yes/No
- Mint Authority: Enabled/Disabled
- Freeze Authority: Enabled/Disabled

Holder Distribution:
- Top 10 Holders: <x>%
- Whale %: <x>% | Bundler %: <x>% | Sniper %: <x>%

Risk Level: [Critical / High / Medium / Low]
Recommendation: <actionable advice>
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Token not found" | Invalid address or token does not exist | Ask user to verify the address; try `onchainos token search` |
| "Chain not supported" | Wrong chain parameter | Confirm the token is on Solana |
| "Rate limited" | Too many API requests | Wait 10 seconds and retry once |
| "Network error" | Connectivity issue | Check network and retry |
| Command returns empty data | Token too new or delisted | Inform user that data is unavailable, advise extra caution |

## Skill Routing

- User wants to **buy/swap** the token after analysis → use `okx-dex-swap` skill
- User wants to check **wallet balance** → use `okx-wallet-portfolio` skill
- User wants to track **smart money signals** on this token → use `okx-dex-signal` skill
- User wants **price chart / K-line** data → use `okx-dex-market` skill
- User wants to check **dev reputation / pump.fun launch history** → use `okx-dex-trenches` skill
