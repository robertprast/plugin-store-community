# sol-token-guard1 CLI Reference

## Token Commands

| Command | Description |
|---------|-------------|
| `onchainos token search --query <name> --chain solana` | Search token by name/symbol |
| `onchainos token info --address <addr> --chain solana` | Get token metadata and market data |
| `onchainos token holder --address <addr> --chain solana` | Get holder distribution |
| `onchainos token top-trader --address <addr> --chain solana` | Get top traders for this token |

## Security Commands

| Command | Description |
|---------|-------------|
| `onchainos security token-scan --address <addr> --chain solana` | Scan token for honeypot, mint/freeze authority risks |

## Common Flags

- `--chain solana` — specify Solana chain
- `--address <addr>` — token contract address (base58)
- `--query <text>` — search keyword
