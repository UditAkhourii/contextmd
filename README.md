# Moltext

> **Note**: Moltext was previously released as ContextMD.

## Agent-native documentation compiler for Moltbots and autonomous agents.

<p align="center">
  <a href="https://github.com/UditAkhourii/moltext/actions"><img src="https://img.shields.io/github/actions/workflow/status/UditAkhourii/moltext/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/moltext"><img src="https://img.shields.io/npm/v/moltext?style=for-the-badge&color=blue" alt="NPM Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg?style=for-the-badge" alt="CC BY-NC 4.0"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/Written_in-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

Human documentation is optimized for humans, not agents. Agents ingest context; they do not navigate websites. Moltext is the compile step between human docs and agent memory. It output is a deterministic `context.md`.

## Moltbots & Agent Systems

Moltbots and other autonomous agents require single-file, noise-free context to operate reliably. `context.md` is designed to be dropped directly into Moltbot workflows (memory or RAG pipelines). Moltext exists to standardize agent-readable documentation, ensuring deterministic input, memory stability, and entropy reduction.

## Pipeline

1. **Parse**: Crawl the documentation site.
2. **Normalize**: Clean and standardizing the HTML.
3. **Compile**: Use an LLM to structurally compress the content into agent-readable form.
4. **Emit**: Generate the final `context.md`.

## Installation

```bash
npm install -g moltext
```

## Usage

```bash
moltext [options] <url>
```

### Options

- `-k, --key <key>`: API Key (optional for local LLMs or raw mode)
- `-u, --base-url <url>`: API Base URL (default: `https://api.openai.com/v1`)
- `-m, --model <model>`: Model name (default: `gpt-4o-mini`)
- `-r, --raw`: Skip LLM processing (parser only)
- `-o, --output <path>`: Output file path (default: `context.md`)
- `-l, --limit <number>`: Max pages to parse (default: 100)

### Examples

**Standard Usage (OpenAI):**
```bash
moltext https://docs.example.com -o context.md
```

**Raw Mode (No API Key):**
Deterministic output. Delegates phrasing/summary logic to the consuming agent.
```bash
moltext https://docs.example.com --raw
```

**Using a Moltbot / Local Model (Ollama):**
Instruct the compiler to use the same brain as your agent.
```bash
moltext https://docs.example.com \
  --base-url http://localhost:11434/v1 \
  --model llama3
```

## OpenClaw / ClawHub Integration

Moltext is designed to be a "skill" or "tool" for [OpenClaw (Moltbot)](https://docs.molt.bot/).

1.  **Install**: `npm install -g moltext` on your Moltbot server.
2.  **Usage**: Create a skill that invokes `moltext <url> --raw`.
3.  **Consumption**: Moltbot reads the pure markdown output and uses its own context window to answer user queries or perform tasks.


## License

© Udit Akhouri — Moltext

CC-BY-NC-4.0
