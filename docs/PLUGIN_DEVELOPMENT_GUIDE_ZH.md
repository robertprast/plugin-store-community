# 插件开发与提交指南

> 本指南将带你完成 Plugin Store 插件的开发和提交全流程。读完本文，你将拥有一个可以与 onchainos CLI 集成的完整插件。

---

## 目录

1. [什么是插件？](#1-什么是插件)
2. [开始之前](#2-开始之前)
3. [第一步：生成插件脚手架](#3-第一步生成插件脚手架)
4. [第二步：编写 plugin.yaml](#4-第二步编写-pluginyaml)
5. [第三步：编写 SKILL.md](#5-第三步编写-skillmd)
6. [第四步：声明权限](#6-第四步声明权限)
7. [第五步：本地验证](#7-第五步本地验证)
8. [第六步：通过 Pull Request 提交](#8-第六步通过-pull-request-提交)
9. [提交后会发生什么](#9-提交后会发生什么)
10. [更新你的插件](#10-更新你的插件)
11. [规则与限制](#11-规则与限制)
12. [SKILL.md 写作指南](#12-skillmd-写作指南)
13. [onchainos 命令参考](#13-onchainos-命令参考)
14. [常见问题](#14-常见问题)

---

## 1. 什么是插件？

Plugin Store 的插件本质上是一个 **Skill（技能）** — 一个 Markdown 文档（SKILL.md），它教 AI Agent（Claude Code、Cursor、OpenClaw）如何使用 onchainos CLI 执行特定的链上任务。

```
你的插件 (SKILL.md)
  │
  │  "当用户问 SOL 的价格时，
  │   执行: onchainos market price --address <地址> --chain solana"
  │
  ▼
AI Agent 读取你的 SKILL.md → 理解该做什么 → 调用 onchainos CLI
  │
  ▼
onchainos CLI → OKX Web3 API → 区块链数据
```

插件不是二进制文件，不是服务器，不是可执行代码。它是一组 AI Agent 遵循的指令。

---

## 2. 开始之前

### 前置条件

- **Git** 和 **GitHub 账号**
- 安装 **plugin-store CLI**：
  ```bash
  # macOS / Linux
  curl -fsSL https://raw.githubusercontent.com/yz06276/plugin-store/main/install-local.sh | bash
  ```
- 安装 **onchainos CLI**（用于测试命令）：
  ```bash
  curl -fsSL https://raw.githubusercontent.com/okx/onchainos-skills/main/install.sh | bash
  ```
- 了解你的插件所涉及的区块链/DeFi 领域

### 核心规则

> **所有插件必须通过 onchainos CLI 进行链上操作。** 不允许自行实现价格查询、钱包签名、交易构建或 RPC 调用。onchainos 已经提供了所有这些能力 — 你的插件只需告诉 AI Agent 如何以及何时使用它们。

---

## 3. 第一步：生成插件脚手架

```bash
plugin-store init my-awesome-plugin
```

生成标准目录结构：

```
my-awesome-plugin/
├── plugin.yaml                        # 插件清单（需要填写）
├── skills/
│   └── my-awesome-plugin/
│       ├── SKILL.md                   # 技能定义（需要编写）
│       └── references/
│           └── cli-reference.md       # CLI 参考文档（需要编写）
├── LICENSE                            # MIT 许可证模板
├── CHANGELOG.md                       # 版本变更记录
└── README.md                          # 插件说明
```

---

## 4. 第二步：编写 plugin.yaml

plugin.yaml 是插件的清单文件，描述插件的基本信息、组件和权限。

### 完整示例

```yaml
schema_version: 1
name: sol-price-checker              # 小写字母 + 连字符，2-40 个字符
alias: "Solana 价格查询"              # 可选：展示名称（支持中文）
version: "1.0.0"                     # 语义化版本号 (x.y.z)
description: "Query real-time token prices on Solana with market data and trend analysis"
author:
  name: "你的名字"
  github: "your-github-username"     # 必须与 PR 提交者一致
  email: "you@example.com"          # 可选：用于安全通知
license: MIT
category: analytics                  # 见下方分类列表
tags:
  - solana
  - price
  - analytics

components:
  skill:
    dir: skills/sol-price-checker    # SKILL.md 所在目录的路径

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
  protocols: []                      # 例如 [uniswap-v3, raydium]
  risk_level: low                    # low | medium | high
```

### 字段说明

| 字段 | 必填 | 规则 |
|------|------|------|
| `name` | 是 | 小写字母、数字和连字符 `[a-z0-9-]`，2-40 个字符，不能有连续连字符 |
| `version` | 是 | 语义化版本号：`x.y.z` |
| `description` | 是 | 一行描述，建议 200 字符以内 |
| `author.name` | 是 | 你的名字或组织名 |
| `author.github` | 是 | 你的 GitHub 用户名（必须与 PR 提交者一致） |
| `license` | 是 | SPDX 标识符：MIT, Apache-2.0, GPL-3.0 等 |
| `category` | 是 | `trading-strategy`, `defi-protocol`, `analytics`, `utility`, `security`, `wallet`, `nft` |
| `tags` | 否 | 搜索关键词 |
| `components.skill.dir` | 是 | SKILL.md 所在目录的相对路径 |
| `permissions` | 是 | 见[第四步：声明权限](#6-第四步声明权限) |
| `extra.risk_level` | 否 | `low`、`medium` 或 `high` |

### 命名规则

- 允许：`solana-price-checker`、`defi-yield-optimizer`、`nft-tracker`
- 禁止：`OKX-Plugin`（保留前缀）、`my_plugin`（下划线）、`a`（太短）
- 保留前缀：`okx-`、`official-`、`plugin-store-`

---

## 5. 第三步：编写 SKILL.md

SKILL.md 是插件的核心。它教 AI Agent 你的插件做什么，以及如何使用 onchainos 命令来完成任务。

### 模板

```markdown
---
name: my-awesome-plugin
description: "简要描述这个技能做什么"
version: "1.0.0"
author: "你的名字"
tags:
  - 关键词1
  - 关键词2
---

# My Awesome Plugin

## Overview

[2-3 句话：这个技能让 AI Agent 能做什么？]

## Pre-flight Checks

使用此技能前，请确保：

1. 已安装并配置 `onchainos` CLI
2. [其他前置条件]

## Commands

### [命令名称]

\`\`\`bash
onchainos <命令> <子命令> --参数 值
\`\`\`

**When to use**: [描述 AI 应该在什么场景下使用此命令]
**Output**: [描述命令返回什么内容]
**Example**: [展示一个具体示例]

## Error Handling

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| "Token not found" | 无效的 Token 符号 | 让用户确认 Token 名称 |
| "Rate limited" | 请求过于频繁 | 等待 10 秒后重试 |

## Skill Routing

- 需要代币交换 → 使用 `okx-dex-swap` 技能
- 需要钱包余额 → 使用 `okx-wallet-portfolio` 技能
- 需要安全扫描 → 使用 `okx-security` 技能
```

### SKILL.md 写作最佳实践

1. **要具体** — "执行 `onchainos token search --query SOL --chain solana`" 比 "搜索代币" 好得多
2. **必须包含错误处理** — AI Agent 需要知道出错时该怎么做
3. **使用技能路由** — 告诉 AI 什么时候应该转交给其他技能，而不是试图处理所有事情
4. **包含前置检查** — 使用你的技能前需要满足什么条件
5. **不要重复 onchainos 的能力** — 你的技能应该编排 onchainos 命令，而不是替代它们

---

## 6. 第四步：声明权限

每个插件都必须声明自己能做什么。审查过程中会进行验证。

### 钱包权限

```yaml
permissions:
  wallet:
    read_balance: true       # 能否读取钱包余额？
    send_transaction: false   # 能否发起转账？
    sign_message: false       # 能否签名消息？
    contract_call: false      # 能否调用智能合约？
```

> **重要提示：** 社区插件首次提交不允许设置 `send_transaction` 或 `contract_call` 为 `true`。你需要达到 Verified Publisher（认证开发者）等级后才能使用（需 5 次以上审核通过的提交）。

### 网络权限

```yaml
  network:
    api_calls: []            # 外部 API 域名（如有）
    onchainos_commands:      # 你的 SKILL.md 中使用的每一个 onchainos 命令
      - "token search"
      - "market price"
      - "swap quote"
```

你必须列出 SKILL.md 中引用的每一个 `onchainos` 命令。AI 审查会交叉验证。

### 链声明

```yaml
  chains:
    - solana
    - ethereum
```

声明你的插件在哪些区块链上运行。

---

## 7. 第五步：本地验证

提交前在本地验证你的插件：

```bash
plugin-store lint ./my-awesome-plugin/
```

### 全部通过时：

```
Linting ./my-awesome-plugin/...

✓ Plugin 'my-awesome-plugin' passed all checks!
```

### 有错误时：

```
Linting ./my-awesome-plugin/...

  ❌ [E031] name 'My-Plugin' must be lowercase alphanumeric with hyphens only
  ❌ [E065] permissions field is required
  ⚠️  [W091] SKILL.md frontmatter missing recommended field: description

✗ Plugin 'My-Plugin': 2 error(s), 1 warning(s)
```

修复所有错误（❌）后再提交。警告（⚠️）是建议性的。

### 常见 Lint 错误

| 错误码 | 含义 | 修复方法 |
|--------|------|---------|
| E001 | plugin.yaml 未找到 | 确保 plugin.yaml 在提交目录的根目录 |
| E031 | 名称格式无效 | 只使用小写字母、数字和连字符 |
| E033 | 使用了保留前缀 | 名称不要以 `okx-`、`official-` 或 `plugin-store-` 开头 |
| E035 | 版本号无效 | 使用语义化版本号：`1.0.0`，而不是 `1.0` 或 `v1.0.0` |
| E041 | 缺少 LICENSE | 在提交目录中添加 LICENSE 文件 |
| E052 | 缺少 SKILL.md | 确保 SKILL.md 存在于 `components.skill.dir` 指定的路径中 |
| E065 | 缺少 permissions | 在 plugin.yaml 中添加 `permissions` 部分 |
| E110 | 不允许 MCP 组件 | 社区插件不能包含 MCP 组件 |
| E111 | 不允许 Binary 组件 | 社区插件不能包含 Binary 组件 |

---

## 8. 第六步：通过 Pull Request 提交

### 1. Fork 社区仓库

访问 https://github.com/yz06276/plugin-store-community 点击 **Fork**。

### 2. 克隆你的 Fork

```bash
git clone git@github.com:你的用户名/plugin-store-community.git
cd plugin-store-community
```

### 3. 将插件复制到 submissions/ 目录

```bash
cp -r /path/to/my-awesome-plugin submissions/my-awesome-plugin
```

### 4. 确认目录结构

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

### 5. 提交并推送

```bash
git checkout -b submit/my-awesome-plugin
git add submissions/my-awesome-plugin/
git commit -m "[new-plugin] my-awesome-plugin v1.0.0"
git push origin submit/my-awesome-plugin
```

### 6. 创建 Pull Request

在 GitHub 上你的 Fork 页面点击 **"Compare & pull request"**。使用以下标题格式：

```
[new-plugin] my-awesome-plugin v1.0.0
```

PR 模板会引导你完成检查清单。

### PR 重要规则

- 每个 PR 只包含 **一个插件**
- 只修改 `submissions/你的插件名/` 目录下的文件
- 不要修改其他文件（README.md、workflows 等）
- 目录名必须与 plugin.yaml 中的 `name` 字段一致

---

## 9. 提交后会发生什么

### 自动化检查（约 5 分钟）

```
Phase 2：结构验证（lint）
  → 自动检查 15+ 项规则
  → 在 PR 评论中发布检查结果
  → 如果失败：PR 被阻止，修复后重新推送

Phase 3：AI 代码审查（Claude）
  → 读取你的插件 + 最新的 onchainos 源码
  → 生成 8 个章节的审查报告
  → 在 PR 评论中发布报告（可折叠展开）
  → 仅供参考 — 不会阻止合并
```

### 人工审核（1-3 天）

维护者会审核：

- 插件是否有意义？
- 权限声明是否准确？
- SKILL.md 写得好不好？
- 是否存在安全隐患？

### 合并后

你的插件会自动：

1. 添加到主 plugin-store 仓库的 `registry.json` 中
2. 创建 git tag `plugins/my-awesome-plugin@1.0.0`
3. 所有用户可通过 `plugin-store install my-awesome-plugin` 安装

---

## 10. 更新你的插件

### 内容更新（修改 SKILL.md、添加命令）

1. 修改 `submissions/my-awesome-plugin/` 下的文件
2. 在 plugin.yaml 中升级 `version`（例如 `1.0.0` → `1.1.0`）
3. 更新 CHANGELOG.md
4. 创建 PR，标题格式：`[update] my-awesome-plugin v1.1.0`

### 权限变更（需要完整审核）

如果你的更新修改了 `permissions` 部分，审核会更加严格。AI 审查报告会重点标注权限变化。

---

## 11. 规则与限制

### 社区插件可以做的

- 使用 SKILL.md 定义技能
- 引用任何 onchainos CLI 命令
- 包含参考文档
- 声明只读的钱包权限

### 社区插件不能做的

- 包含 MCP Server 组件（代码执行）
- 包含 Binary 组件（代码执行）
- 首次提交声明 `send_transaction: true`
- 首次提交声明 `contract_call: true`
- 使用保留名称前缀（`okx-`、`official-`、`plugin-store-`）
- 绕过 onchainos CLI（使用直接 RPC、外部价格 API、web3 库）
- 包含 prompt injection 模式
- 超过文件大小限制（单文件 100KB，总计 1MB）

### 信任等级

| 等级 | 谁 | 能力范围 |
|------|-----|---------|
| community（社区） | 首次贡献者 | 仅 Skill，只读权限 |
| verified（认证） | 5 次以上审核通过 | Skill + 更高权限 |
| dapp-official（DApp 官方） | 知名 DApp 团队 | 完整能力 |
| official（官方） | OKX 团队 | 完整能力 |

---

## 12. SKILL.md 写作指南

### 结构清单

- [ ] YAML frontmatter 包含 `name` 和 `description`
- [ ] Overview 部分（这个技能做什么？）
- [ ] Pre-flight Checks 部分（使用前需要什么？）
- [ ] Commands 部分（每个 onchainos 命令的使用场景/方式/输出）
- [ ] Error Handling 表格
- [ ] Skill Routing（什么时候转交给其他技能）

### 好的 vs 不好的示例

**不好：模糊的指令**
```
用 onchainos 获取价格。
```

**好：具体且可执行**
```
要获取 Solana 代币的当前价格：

\`\`\`bash
onchainos market price --address <TOKEN_ADDRESS> --chain solana
\`\`\`

**使用场景**: 当用户问"[代币]的价格是多少？"且在 Solana 链上时。
**输出**: 当前美元价格、24 小时涨跌幅、24 小时交易量。
**如果找不到代币**: 让用户确认合约地址，或先执行 `onchainos token search --query <名称> --chain solana` 搜索。
```

---

## 13. onchainos 命令参考

你的 SKILL.md 只应使用 onchainos CLI 命令。以下是可用的顶级命令：

| 命令 | 说明 | 示例 |
|------|------|------|
| `onchainos token` | 代币搜索、信息、趋势、持仓者 | `onchainos token search --query SOL` |
| `onchainos market` | 价格、K 线图、组合 PnL | `onchainos market price --address 0x... --chain ethereum` |
| `onchainos swap` | DEX 交换报价和执行 | `onchainos swap quote --from ETH --to USDC --amount 1` |
| `onchainos gateway` | Gas 估算、交易模拟、广播 | `onchainos gateway gas --chain ethereum` |
| `onchainos portfolio` | 钱包总价值和余额 | `onchainos portfolio all-balances --address 0x...` |
| `onchainos wallet` | 登录、余额、转账、历史 | `onchainos wallet balance --chain solana` |
| `onchainos security` | 代币扫描、DApp 扫描、交易扫描 | `onchainos security token-scan --address 0x...` |
| `onchainos signal` | 智能资金 / 鲸鱼信号 | `onchainos signal list --chain solana` |
| `onchainos memepump` | Meme 代币扫描和分析 | `onchainos memepump tokens --chain solana` |
| `onchainos leaderboard` | 按 PnL/交易量排名的顶级交易者 | `onchainos leaderboard list --chain solana` |
| `onchainos payment` | x402 支付协议 | `onchainos payment x402-pay --url ...` |

要查看完整的子命令列表，运行 `onchainos <命令> --help` 或参阅 [onchainos 文档](https://github.com/okx/onchainos-skills)。

---

## 14. 常见问题

**Q: 我可以直接调用外部 API 吗？**
A: 不可以。所有链上操作必须通过 onchainos CLI。如果你需要 onchainos 尚未提供的能力，请在 onchainos 仓库提交 feature request。

**Q: 我可以包含二进制文件或 MCP Server 吗？**
A: 社区插件目前不允许。等平台支持源码审核和编译后，此功能将开放。

**Q: 审核需要多长时间？**
A: 自动化检查约 5 分钟完成。人工审核通常需要 1-3 个工作日。

**Q: AI 审查标记了问题怎么办？**
A: AI 审查仅供参考 — 不会阻止你的 PR。但人工审核者会阅读 AI 报告。建议解决标记的问题以加快审批速度。

**Q: 发布后可以更新插件吗？**
A: 可以。提交新的 PR，包含更新后的文件和升级的版本号。

**Q: 如何成为认证开发者（Verified Publisher）？**
A: 累计 5 次以上审核通过的插件提交后，可以申请 Verified Publisher 等级。这将解锁更高权限和更快的审核速度。

**Q: 本地 `plugin-store lint` 通过了，但 GitHub 检查失败？**
A: 确保你使用的是最新版本的 plugin-store CLI。同时确保 PR 只修改了 `submissions/你的插件名/` 目录下的文件。
