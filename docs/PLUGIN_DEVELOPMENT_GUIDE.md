# Plugin Development & Submission Guide

> This guide walks you through developing a plugin for the Plugin Store ecosystem and submitting it for review. By the end, you will have a working plugin that integrates with the onchainos CLI.

---

## Table of Contents

1. [What is a Plugin?](#1-what-is-a-plugin)
2. [Before You Start](#2-before-you-start)
3. [Step 1: Scaffold Your Plugin](#3-step-1-scaffold-your-plugin)
4. [Step 2: Write plugin.yaml](#4-step-2-write-pluginyaml)
5. [Step 3: Write SKILL.md](#5-step-3-write-skillmd)
6. [Step 4: Declare Permissions](#6-step-4-declare-permissions)
7. [Step 5: Local Validation](#7-step-5-local-validation)
8. [Step 6: Submit via Pull Request](#8-step-6-submit-via-pull-request)
9. [What Happens After Submission](#9-what-happens-after-submission)
10. [Updating Your Plugin](#10-updating-your-plugin)
11. [Rules & Restrictions](#11-rules--restrictions)
12. [SKILL.md Writing Guide](#12-skillmd-writing-guide)
13. [onchainos Command Reference](#13-onchainos-command-reference)
14. [FAQ](#14-faq)

---

## 1. What is a Plugin?

A Plugin Store plugin is a **Skill** — a markdown document (SKILL.md) that teaches AI agents (Claude Code, Cursor, OpenClaw) how to perform specific on-chain tasks using the onchainos CLI.

```
Your Plugin (SKILL.md)
  │
  │  "When the user asks to check SOL price,
  │   run: onchainos market price --address <addr> --chain solana"
  │
  ▼
AI Agent reads your SKILL.md → understands what to do → calls onchainos CLI
  │
  ▼
onchainos CLI → OKX Web3 API → blockchain data
```

A plugin is NOT a binary, NOT a server, NOT executable code. It is a set of instructions that an AI agent follows.

---

## 2. Before You Start

### Prerequisites

- **Git** and a **GitHub account**
- **plugin-store CLI** installed:
  ```bash
  # macOS / Linux
  curl -fsSL https://raw.githubusercontent.com/yz06276/plugin-store/main/install-local.sh | bash
  ```
- **onchainos CLI** installed (for testing your commands):
  ```bash
  curl -fsSL https://raw.githubusercontent.com/okx/onchainos-skills/main/install.sh | bash
  ```
- Basic understanding of the blockchain/DeFi domain your plugin covers

### Key Rule

> **All plugins must use onchainos CLI for on-chain operations.** You cannot implement your own price queries, wallet signing, transaction building, or RPC calls. onchainos provides all of these — your plugin tells the AI agent how and when to use them.

---

## 3. Step 1: Scaffold Your Plugin

```bash
plugin-store init my-awesome-plugin
```

This generates a standard directory:

```
my-awesome-plugin/
├── plugin.yaml                        # Plugin manifest (you fill this in)
├── skills/
│   └── my-awesome-plugin/
│       ├── SKILL.md                   # Skill definition (you write this)
│       └── references/
│           └── cli-reference.md       # CLI reference docs (you write this)
├── LICENSE                            # MIT license template
├── CHANGELOG.md                       # Version history
└── README.md                          # Plugin description
```

---

## 4. Step 2: Write plugin.yaml

This is your plugin's manifest. It tells the Plugin Store what your plugin is, who wrote it, and what it can do.

### Complete Example

```yaml
schema_version: 1
name: sol-price-checker              # Lowercase, hyphens only, 2-40 chars
alias: "Solana Price Checker"        # Optional: display name
version: "1.0.0"                     # Semantic versioning (x.y.z)
description: "Query real-time token prices on Solana with market data and trend analysis"
author:
  name: "Your Name"
  github: "your-github-username"     # Must match PR author
  email: "you@example.com"          # Optional: for security notifications
license: MIT
category: analytics                  # See categories below
tags:
  - solana
  - price
  - analytics

components:
  skill:
    dir: skills/sol-price-checker    # Path to your SKILL.md directory

permissions:
  wallet:
    read_balance: false
    send_transaction: false
    sign_message: false
    contract_call: false
  network:
    api_calls: []
    onchainos_commands:
      - "token search"
      - "market price"
      - "market kline"
      - "token trending"
  chains:
    - solana

extra:
  protocols: []                      # e.g. [uniswap-v3, raydium]
  risk_level: low                    # low | medium | high
```

### Field Reference

| Field | Required | Rules |
|-------|----------|-------|
| `name` | Yes | Lowercase, `[a-z0-9-]`, 2-40 chars, no consecutive hyphens |
| `version` | Yes | Semantic versioning: `x.y.z` |
| `description` | Yes | One line, under 200 characters recommended |
| `author.name` | Yes | Your name or organization |
| `author.github` | Yes | Your GitHub username (must match PR author) |
| `license` | Yes | SPDX identifier: MIT, Apache-2.0, GPL-3.0, etc. |
| `category` | Yes | One of: `trading-strategy`, `defi-protocol`, `analytics`, `utility`, `security`, `wallet`, `nft` |
| `tags` | No | Keywords for search |
| `components.skill.dir` | Yes | Relative path to the directory containing SKILL.md |
| `permissions` | Yes | See [Step 4: Declare Permissions](#6-step-4-declare-permissions) |
| `extra.risk_level` | No | `low`, `medium`, or `high` |

### Naming Rules

- Allowed: `solana-price-checker`, `defi-yield-optimizer`, `nft-tracker`
- Forbidden: `OKX-Plugin` (reserved prefix), `my_plugin` (underscores), `a` (too short)
- Reserved prefixes: `okx-`, `official-`, `plugin-store-`

---

## 5. Step 3: Write SKILL.md

SKILL.md is the core of your plugin. It teaches the AI agent what your plugin does and how to use onchainos commands to accomplish tasks.

### Template

```markdown
---
name: my-awesome-plugin
description: "Brief description of what this skill does"
version: "1.0.0"
author: "Your Name"
tags:
  - keyword1
  - keyword2
---

# My Awesome Plugin

## Overview

[2-3 sentences: what does this skill enable the AI agent to do?]

## Pre-flight Checks

Before using this skill, ensure:

1. The `onchainos` CLI is installed and configured
2. [Any other prerequisites]

## Commands

### [Command Name]

\`\`\`bash
onchainos <command> <subcommand> --flag value
\`\`\`

**When to use**: [Describe when the AI should use this command]
**Output**: [Describe what the command returns]
**Example**: [Show a concrete example with real values]

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Token not found" | Invalid token symbol | Ask user to verify the token name |
| "Rate limited" | Too many requests | Wait 10 seconds and retry |

## Skill Routing

- For token swaps → use `okx-dex-swap` skill
- For wallet balances → use `okx-wallet-portfolio` skill
- For security scanning → use `okx-security` skill
```

### SKILL.md Best Practices

1. **Be specific** — "Run `onchainos token search --query SOL --chain solana`" is better than "search for tokens"
2. **Always include error handling** — The AI agent needs to know what to do when things fail
3. **Use skill routing** — Tell the AI when to defer to other skills instead of trying to handle everything
4. **Include pre-flight checks** — What conditions must be met before using your skill
5. **Don't duplicate onchainos capabilities** — Your skill should orchestrate onchainos commands, not replace them

---

## 6. Step 4: Declare Permissions

Every plugin must declare what it can do. This is verified during review.

### Wallet Permissions

```yaml
permissions:
  wallet:
    read_balance: true       # Can read wallet balances?
    send_transaction: false   # Can initiate transfers?
    sign_message: false       # Can sign messages?
    contract_call: false      # Can call smart contracts?
```

> **Important:** Community plugins cannot set `send_transaction` or `contract_call` to `true` on their first submission. You must reach Verified Publisher status first (5+ approved submissions).

### Network Permissions

```yaml
  network:
    api_calls: []            # External API domains (if any)
    onchainos_commands:      # EVERY onchainos command your skill uses
      - "token search"
      - "market price"
      - "swap quote"
```

You must list every `onchainos` command your SKILL.md references. The AI review will cross-check this.

### Chain Declaration

```yaml
  chains:
    - solana
    - ethereum
```

Declare which blockchains your plugin operates on.

---

## 7. Step 5: Local Validation

Before submitting, validate your plugin locally:

```bash
plugin-store lint ./my-awesome-plugin/
```

### If everything passes:

```
Linting ./my-awesome-plugin/...

✓ Plugin 'my-awesome-plugin' passed all checks!
```

### If there are errors:

```
Linting ./my-awesome-plugin/...

  ❌ [E031] name 'My-Plugin' must be lowercase alphanumeric with hyphens only
  ❌ [E065] permissions field is required
  ⚠️  [W091] SKILL.md frontmatter missing recommended field: description

✗ Plugin 'My-Plugin': 2 error(s), 1 warning(s)
```

Fix all errors (❌) before submitting. Warnings (⚠️) are advisory.

### Common Lint Errors

| Code | Meaning | Fix |
|------|---------|-----|
| E001 | plugin.yaml not found | Ensure plugin.yaml is in the root of your submission directory |
| E031 | Invalid name format | Use lowercase letters, numbers, and hyphens only |
| E033 | Reserved prefix | Don't start your name with `okx-`, `official-`, or `plugin-store-` |
| E035 | Invalid version | Use semantic versioning: `1.0.0`, not `1.0` or `v1.0.0` |
| E041 | Missing LICENSE | Add a LICENSE file to your submission directory |
| E052 | Missing SKILL.md | Ensure SKILL.md exists in the path specified by `components.skill.dir` |
| E065 | Missing permissions | Add the `permissions` section to plugin.yaml |
| E110 | MCP not allowed | Community plugins cannot include MCP components |
| E111 | Binary not allowed | Community plugins cannot include Binary components |

---

## 8. Step 6: Submit via Pull Request

### 1. Fork the community repository

Go to https://github.com/yz06276/plugin-store-community and click **Fork**.

### 2. Clone your fork

```bash
git clone git@github.com:YOUR_USERNAME/plugin-store-community.git
cd plugin-store-community
```

### 3. Copy your plugin into submissions/

```bash
cp -r /path/to/my-awesome-plugin submissions/my-awesome-plugin
```

### 4. Verify the directory structure

```
submissions/
  my-awesome-plugin/
    plugin.yaml
    skills/
      my-awesome-plugin/
        SKILL.md
        references/
          cli-reference.md
    LICENSE
    CHANGELOG.md
    README.md
```

### 5. Commit and push

```bash
git checkout -b submit/my-awesome-plugin
git add submissions/my-awesome-plugin/
git commit -m "[new-plugin] my-awesome-plugin v1.0.0"
git push origin submit/my-awesome-plugin
```

### 6. Open a Pull Request

Go to your fork on GitHub and click **"Compare & pull request"**. Use this title format:

```
[new-plugin] my-awesome-plugin v1.0.0
```

The PR template will guide you through the checklist.

### Important Rules for PRs

- Each PR should contain **one plugin only**
- Only modify files inside `submissions/your-plugin-name/`
- Do not modify any other files (README.md, workflows, etc.)
- The directory name must match the `name` field in plugin.yaml

---

## 9. What Happens After Submission

### Automated Checks (~5 minutes)

```
Phase 2: Structure Validation (lint)
  → Checks all 15+ rules automatically
  → Posts results as a PR comment
  → If failed: PR is blocked, fix and push again

Phase 3: AI Code Review (Claude)
  → Reads your plugin + latest onchainos source code
  → Generates an 8-section review report
  → Posts report as a PR comment (collapsible sections)
  → Advisory only — does NOT block merge
```

### Human Review (1-3 days)

A maintainer reviews:

- Does the plugin make sense?
- Are permissions accurate?
- Is the SKILL.md well-written?
- Any security concerns?

### After Merge

Your plugin is automatically:

1. Added to `registry.json` in the main plugin-store repo
2. Tagged with `plugins/my-awesome-plugin@1.0.0`
3. Available to all users via `plugin-store install my-awesome-plugin`

---

## 10. Updating Your Plugin

### Content Update (SKILL.md changes, new commands)

1. Modify files in `submissions/my-awesome-plugin/`
2. Bump `version` in plugin.yaml (e.g., `1.0.0` → `1.1.0`)
3. Update CHANGELOG.md
4. Open a PR with title: `[update] my-awesome-plugin v1.1.0`

### Permission Change (requires full review)

If your update changes the `permissions` section, the review will be more thorough. The AI review report will highlight permission changes.

---

## 11. Rules & Restrictions

### What Community Plugins CAN Do

- Define skills using SKILL.md
- Reference any onchainos CLI command
- Include reference documentation
- Declare read-only wallet permissions

### What Community Plugins CANNOT Do

- Include MCP server components (code execution)
- Include binary components (code execution)
- Declare `send_transaction: true` on first submission
- Declare `contract_call: true` on first submission
- Use reserved name prefixes (`okx-`, `official-`, `plugin-store-`)
- Bypass onchainos CLI (use direct RPC, external price APIs, web3 libraries)
- Include prompt injection patterns
- Exceed file size limits (100KB per file, 1MB total)

### Trust Levels

| Level | Who | Capabilities |
|-------|-----|-------------|
| community | First-time contributors | Skill only, read-only permissions |
| verified | 5+ approved submissions | Skill + elevated permissions |
| dapp-official | Known DApp teams | Full capabilities |
| official | OKX team | Full capabilities |

---

## 12. SKILL.md Writing Guide

### Structure Checklist

- [ ] YAML frontmatter with `name` and `description`
- [ ] Overview section (what does this skill do?)
- [ ] Pre-flight checks (what's needed before use?)
- [ ] Commands section (each onchainos command with when/how/output)
- [ ] Error handling table
- [ ] Skill routing (when to defer to other skills)

### Good vs Bad Examples

**Bad: vague instructions**
```
Use onchainos to get the price.
```

**Good: specific and actionable**
```
To get the current price of a Solana token:

\`\`\`bash
onchainos market price --address <TOKEN_ADDRESS> --chain solana
\`\`\`

**When to use**: When the user asks "what's the price of [token]?" on Solana.
**Output**: Current price in USD, 24h change percentage, 24h volume.
**If the token is not found**: Ask the user to verify the contract address or try `onchainos token search --query <NAME> --chain solana` first.
```

---

## 13. onchainos Command Reference

Your SKILL.md should only use onchainos CLI commands. Here are the available top-level commands:

| Command | Description | Example |
|---------|-------------|---------|
| `onchainos token` | Token search, info, trending, holders | `onchainos token search --query SOL` |
| `onchainos market` | Price, kline charts, portfolio PnL | `onchainos market price --address 0x... --chain ethereum` |
| `onchainos swap` | DEX swap quotes and execution | `onchainos swap quote --from ETH --to USDC --amount 1` |
| `onchainos gateway` | Gas estimation, tx simulation, broadcast | `onchainos gateway gas --chain ethereum` |
| `onchainos portfolio` | Wallet total value and balances | `onchainos portfolio all-balances --address 0x...` |
| `onchainos wallet` | Login, balance, send, history | `onchainos wallet balance --chain solana` |
| `onchainos security` | Token scan, dapp scan, tx scan | `onchainos security token-scan --address 0x...` |
| `onchainos signal` | Smart money / whale signals | `onchainos signal list --chain solana` |
| `onchainos memepump` | Meme token scanning and analysis | `onchainos memepump tokens --chain solana` |
| `onchainos leaderboard` | Top traders by PnL/volume | `onchainos leaderboard list --chain solana` |
| `onchainos payment` | x402 payment protocol | `onchainos payment x402-pay --url ...` |

For the full subcommand list, run `onchainos <command> --help` or see the [onchainos documentation](https://github.com/okx/onchainos-skills).

---

## 14. FAQ

**Q: Can I submit a plugin that calls external APIs directly?**
A: No. All on-chain operations must go through onchainos CLI. If you need a capability that onchainos doesn't provide, open a feature request in the onchainos repo.

**Q: Can I include a binary or MCP server?**
A: Not yet for community plugins. This capability will be available once we support platform-managed source auditing and compilation.

**Q: How long does the review take?**
A: Automated checks complete in ~5 minutes. Human review typically takes 1-3 business days.

**Q: What if the AI review flags something?**
A: The AI review is advisory only — it does not block your PR. However, human reviewers will read the AI report. Address any issues flagged to speed up approval.

**Q: Can I update my plugin after it's published?**
A: Yes. Submit a new PR with updated files and a bumped version number.

**Q: How do I become a Verified Publisher?**
A: After 5+ approved plugin submissions, you can apply for Verified Publisher status. This unlocks elevated permissions and faster review.

**Q: My `plugin-store lint` passes but the GitHub check fails. Why?**
A: Make sure you're running the latest version of the plugin-store CLI. Also ensure your PR only modifies files within `submissions/your-plugin-name/`.
