---
name: rust-echo-cli
description: "Text transformation CLI — echo text in uppercase, lowercase, reverse, base64, rot13, or get word count"
version: "1.0.0"
author: "yz06276"
tags:
  - rust
  - text-processing
  - cli
---

# rust-echo-cli

## Overview

This skill provides a text transformation CLI tool built in Rust. It can echo text back with various transformations applied: uppercase, lowercase, reverse, base64 encode, rot13, and word count.

## Pre-flight Checks

Before using this skill, ensure:

1. The `rust-echo-cli` binary is installed (via `plugin-store install rust-echo-cli`)

## Commands

### Echo text (plain)

```bash
rust-echo-cli "Hello World"
```

**When to use**: When the user wants to simply echo text back.
**Output**: The input text printed to stdout.

### Uppercase

```bash
rust-echo-cli --mode uppercase "Hello World"
```

**When to use**: When the user wants text converted to all uppercase.
**Output**: `HELLO WORLD`

### Lowercase

```bash
rust-echo-cli --mode lowercase "Hello World"
```

**When to use**: When the user wants text converted to all lowercase.
**Output**: `hello world`

### Reverse

```bash
rust-echo-cli --mode reverse "Hello World"
```

**When to use**: When the user wants text reversed.
**Output**: `dlroW olleH`

### Base64 Encode

```bash
rust-echo-cli --mode base64 "Hello World"
```

**When to use**: When the user wants text encoded to base64.
**Output**: `SGVsbG8gV29ybGQ=`

### ROT13

```bash
rust-echo-cli --mode rot13 "Hello World"
```

**When to use**: When the user wants ROT13 cipher applied.
**Output**: `Uryyb Jbeyq`

### Word Count

```bash
rust-echo-cli --mode count "Hello World"
```

**When to use**: When the user wants to count words in text.
**Output**: `2 words`

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "Unknown mode" | Invalid --mode value | Use one of: uppercase, lowercase, reverse, base64, rot13, count |
| "No input provided" | Missing text argument | Provide text as a positional argument |
