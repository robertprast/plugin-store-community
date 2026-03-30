---
name: python-nlp-tool
description: "Text echo CLI built in Python"
version: "1.0.0"
author: "yz06276"
tags:
  - python
  - text-processing
---

# Python NLP Tool

## Overview

This skill provides a text echo CLI built in Python, distributed via pip.

## Pre-flight Checks

1. Python 3.8+ and pip must be installed
2. The `python-echo-cli` package is installed (via `plugin-store install python-nlp-tool`)

## Binary Tool Commands

### Echo a message

```bash
python-echo-cli echo "Hello World"
```

**When to use**: When the user wants to echo text through the Python tool.
**Output**: `Echo from Python: Hello World`

### Show version

```bash
python-echo-cli version
```

**When to use**: When the user wants to check the tool version.
**Output**: `python-echo-cli 1.0.0`

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "unknown command" | Invalid command | Use `echo` or `version` |
| Command not found | Package not installed | Run `plugin-store install python-nlp-tool` |
