# sol-token-guard

Comprehensive Solana token safety analysis plugin for onchainOS.

Given a token address, this plugin performs security scanning, holder distribution analysis, and provides a composite risk score with actionable recommendations.

## Features

- Token security scan (honeypot detection, mint/freeze authority check)
- Holder distribution analysis (whale concentration, bundler/sniper detection)
- Token metadata and liquidity check
- Composite risk scoring (Low / Medium / High / Critical)

## Installation

```bash
plugin-store install sol-token-guard
```

## What it does

Ask your AI Agent:

> "Check if this Solana token is safe: `<token_address>`"

The plugin will run security scan, holder analysis, and return a risk assessment.

## License

MIT
