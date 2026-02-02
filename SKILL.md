---
name: moltext
description: Compiles web documentation into agent-native memory context using the Moltext Compiler.
disable-model-invocation: false
metadata:
  icon: 🧬
  tags: [documentation, compiler, memory, context, dev-tool]
---

# Moltext Compiler

**Moltext** is the standard compiler for converting human-optimized documentation (HTML/Web) into **Agent-Native Context** (Markdown). 

Use this skill when you need to "learn" a new library, SDK, or tool to perform a task. Do not try to browse the web raw; use Moltext to normalize the entropy first.

## Usage

### 1. Compile Documentation
To learn about a new tool, run the compiler in **Raw Mode**. This gives you the pure, deterministic structure of the documentation without lossy summarization.

```bash
moltext <url> --raw --output <filename.md>
```

**Example:**
"I need to learn how to use the 'foobar' library."
```bash
moltext https://docs.foobar.com --raw --output foobar_context.md
```

### 2. Ingest Context
After compiling, **READ** the output file. It contains the high-density technical specifications you need.

```bash
cat foobar_context.md
```

## Tips for Agents
- **Always use `--raw`**: You have your own brain. You don't need a sub-model to summarize for you. Get the raw data.
- **Limit Depth**: If the docs are huge, use `--limit 50` to avoid context overflow, or compile specific sub-sections.
- **Trust the Output**: The `context.md` is strictly formatted to preserve code blocks and API signatures.
