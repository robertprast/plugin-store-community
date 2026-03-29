---
name: go-echo-cli
description: "Text hashing and encoding CLI — sha256, md5, hex encode/decode, length, repeat"
version: "1.0.0"
author: "yz06276"
tags:
  - go
  - hashing
  - encoding
---

# go-echo-cli

## Overview

This skill provides a text hashing and encoding CLI tool built in Go. It can compute SHA-256/MD5 hashes, hex encode/decode, count string length, and repeat text.

## Pre-flight Checks

Before using this skill, ensure:

1. The `go-echo-cli` binary is installed (via `plugin-store install go-echo-cli`)

## Commands

### Echo text (plain)

```bash
go-echo-cli "Hello World"
```

**When to use**: When the user wants to simply echo text back.
**Output**: The input text printed to stdout.

### SHA-256 Hash

```bash
go-echo-cli --mode sha256 "Hello World"
```

**When to use**: When the user wants to compute a SHA-256 hash of text.
**Output**: `a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e`

### MD5 Hash

```bash
go-echo-cli --mode md5 "Hello World"
```

**When to use**: When the user wants to compute an MD5 hash of text.
**Output**: `b10a8db164e0754105b7a99be72e3fe5`

### Hex Encode

```bash
go-echo-cli --mode hex "Hello World"
```

**When to use**: When the user wants to hex-encode text.
**Output**: `48656c6c6f20576f726c64`

### Hex Decode

```bash
go-echo-cli --mode unhex "48656c6c6f20576f726c64"
```

**When to use**: When the user wants to decode hex back to text.
**Output**: `Hello World`

### String Length

```bash
go-echo-cli --mode length "Hello World"
```

**When to use**: When the user wants to know the character count of text.
**Output**: `11`

### Repeat Text

```bash
go-echo-cli --mode repeat --count 3 "Hi"
```

**When to use**: When the user wants to repeat text N times.
**Output**: `HiHiHi`

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Unknown mode" | Invalid --mode value | Use one of: sha256, md5, hex, unhex, length, repeat |
| "No input provided" | Missing text argument | Provide text as a positional argument |
| "Invalid hex string" | Non-hex characters in unhex mode | Ensure input contains only 0-9 and a-f |
