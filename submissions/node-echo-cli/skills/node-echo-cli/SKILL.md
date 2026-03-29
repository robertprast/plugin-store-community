---
name: node-echo-cli
description: "System info CLI — file stats, directory listing, environment info, path utilities, disk usage"
version: "1.0.0"
author: "yz06276"
tags:
  - node
  - filesystem
  - system-info
---

# node-echo-cli

## Overview

This skill provides a system info CLI built in Node.js. It can show file stats, list directories, display environment info, resolve paths, and check disk usage.

## Pre-flight Checks

Before using this skill, ensure:

1. The `node-echo-cli` binary is installed (via `plugin-store install node-echo-cli`)

## Commands

### Echo text (plain)

```bash
node-echo-cli "Hello World"
```

**When to use**: When the user wants to simply echo text back.

### File Stats

```bash
node-echo-cli --mode stat /path/to/file
```

**When to use**: When the user wants to see file size, creation date, modification date, and permissions.
**Output**: JSON object with file metadata.

### Directory Listing

```bash
node-echo-cli --mode ls /path/to/directory
```

**When to use**: When the user wants to list files in a directory with sizes and types.
**Output**: Table of files with name, size, and type.

### Environment Info

```bash
node-echo-cli --mode env
```

**When to use**: When the user wants to see system environment information (OS, arch, Node version, memory, uptime).
**Output**: System information summary.

### Path Resolve

```bash
node-echo-cli --mode resolve "./relative/path/../file.txt"
```

**When to use**: When the user wants to resolve a relative path to an absolute path.
**Output**: Absolute resolved path.

### Path Parse

```bash
node-echo-cli --mode parse "/Users/alice/documents/report.pdf"
```

**When to use**: When the user wants to break a path into its components (dir, base, ext, name).
**Output**: JSON with parsed path components.

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| "File not found" | Path does not exist | Verify the file path |
| "Permission denied" | Insufficient permissions | Check file permissions |
| "Unknown mode" | Invalid --mode value | Use one of: stat, ls, env, resolve, parse |
| "No input provided" | Missing path argument | Provide a path as argument |
