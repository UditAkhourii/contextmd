# 🧠 ContextMD

<p align="center">
  <strong>Feed your Agents the Context they deserve.</strong>
</p>

<p align="center">
  <a href="https://github.com/UditAkhourii/contextmd/actions"><img src="https://img.shields.io/github/actions/workflow/status/UditAkhourii/contextmd/ci.yml?branch=main&style=for-the-badge" alt="CI status"></a>
  <a href="https://www.npmjs.com/package/contextmd-cli"><img src="https://img.shields.io/npm/v/contextmd-cli?style=for-the-badge&color=blue" alt="NPM Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="MIT License"></a>
  <a href="https://typescriptlang.org"><img src="https://img.shields.io/badge/Written_in-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
</p>

---

**ContextMD** is the ultimate terminal utility for turning complex documentation websites into a single, high-density **AI Context File**.

Modern LLMs and Agents (like Claude 3.5 Sonnet, GPT-4o, or Gemini 1.5 Pro) are powerful, but they struggle to navigate multi-page documentation sites effectively. They get lost in navigation bars, footers, duplicate content, and fragmented pages.

**ContextMD solves this.** It crawls, cleans, and chemically refines entire documentation sites into a single `context.md` file that you can drop directly into your LLM's context window.

## ✨ Features

- **🕷️ Deep Crawling**: Intelligently traverses documentation sites, following links and building a comprehensive map of the content.
- **🧠 AI-Powered Refinement**: Uses OpenAI's models (configurable) to "read" each page and rewrite it for machine comprehension, stripping fluff and prioritizing logic, API signatures, and examples.
- **🧹 Noise Reduction**: Automatically detects and separates main content from sidebars, headers, footers, and advertisements.
- **⚡ High Performance**: Concurrent processing with a beautiful, real-time CLI dashboard.
- **📄 Single File Output**: Produces a consolidated Markdown file with clear headers and structure, perfect for RAG systems or direct LLM context.

## 🚀 Installation

Ensure you have **Node.js 18+** installed.

### Global Install (Recommended)

```bash
npm install -g contextmd-cli
```

### Run via npx (No install required)

```bash
npx contextmd https://docs.example.com
```

## 🛠️ Usage

### Quick Start

1.  **Get an OpenAI API Key**: ContextMD uses AI to compress and refine the content.
2.  **Run the tool**:

```bash
export OPENAI_API_KEY=sk-proj-...
contextmd https://docs.turso.tech
```

This will generate a `context.md` file in your current directory.

### Command Line Options

```bash
Usage: contextmd [options] <url>

Arguments:
  url                      Base URL of the documentation to convert

Options:
  -k, --key <key>          OpenAI API Key (can also be set via OPENAI_API_KEY env var)
  -o, --output <path>      Output file path (default: "context.md")
  -l, --limit <number>     Max pages to crawl (default: "100")
  -h, --help               display help for command
```

### Examples

**Crawl a specific documentation site with a page limit:**

```bash
contextmd https://developer.spotify.com/documentation/web-api --limit 50
```

**Save to a specific location:**

```bash
contextmd https://stripe.com/docs/api -o ./stripe-context.md
```

## 🏗️ How It Works

ContextMD operates in a three-stage pipeline:

1.  **The Crawler**:
    *   Starts at the provided `url`.
    *   Uses a Breadth-First Search (BFS) algorithm to find internal links.
    *   Filters out external links, social media, and irrelevant pages.
    *   Respects the `--limit` flag to prevent infinite loops on massive sites.

2.  **The Processor (The "Brain")**:
    *   Downloads the raw HTML of each discovered page.
    *   Uses `turndown` and `cheerio` to convert HTML to Markdown.
    *   **AI Step**: Sends the raw Markdown to an LLM with a specialized system prompt designed to:
        *   Summarize verbose sections.
        *   Preserve code blocks and API schemas exactly.
        *   Remove marketing fluff.
        *   Standardize formatting.

3.  **The Compiler**:
    *   Stitches all processed pages into a single `context.md` file.
    *   Adds a metadata header and table of contents structure (implicitly via markdown headers).

## 📦 For Developers

Want to build this from source?

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/UditAkhourii/contextmd.git
    cd contextmd
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Build**:
    ```bash
    npm run build
    ```

4.  **Run locally**:
    ```bash
    node dist/index.js https://example.com
    ```

## 🤝 Contributing

We welcome contributions! Please open an issue or submit a PR if you have ideas for:
- Support for local LLMs (Ollama, etc.)
- Better crawling heuristics for SPA (Single Page Apps).
- Output formats (JSON, JSONL for fine-tuning).

## 📄 License

MIT © [Antigravity](https://github.com/UditAkhourii)
