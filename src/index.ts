#!/usr/bin/env node
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import * as fs from 'fs/promises';
import * as path from 'path';
import 'dotenv/config'; // Load .env if present

import { Crawler } from './crawler';
import { Processor } from './processor';

const program = new Command();

program
    .name('moltext')
    .description('Agent-native documentation compiler for Moltbots')
    .argument('<url>', 'Base URL of the documentation to compile')
    .option('-k, --key <key>', 'API Key (optional if using local inference or raw mode)')
    .option('-u, --base-url <url>', 'Base URL for the LLM (e.g. http://localhost:11434/v1)', 'https://api.openai.com/v1')
    .option('-m, --model <model>', 'Model name to use', 'gpt-4o-mini')
    .option('-r, --raw', 'Raw mode: Skip LLM processing and return clean markdown', false)
    .option('-o, --output <path>', 'Output file path', 'context.md')
    .option('-l, --limit <number>', 'Max pages to parse', '100')
    .action(async (url, options) => {
        try {
            console.log(chalk.bold.cyan('\n🚀 Moltext - Agent-Native Documentation Compiler\n'));

            // Auth Logic:
            // 1. Raw Mode = No Key Needed.
            // 2. Local Base URL = No Key Needed.
            // 3. OpenAI Base URL = Key Required.

            let apiKey = options.key || process.env.OPENAI_API_KEY;

            // If NOT raw mode and NO key provided...
            if (!options.raw && !apiKey) {
                // Check if using local model?
                const isLocal = !options.baseUrl.includes('api.openai.com');

                if (!isLocal) {
                    // Using OpenAI but no key -> Error
                    console.error(chalk.red('❌ Error: API Key is required for OpenAI. Provide it via -k flag or OPENAI_API_KEY env var.'));
                    console.error(chalk.yellow('💡 Tip: Use --raw to skip AI processing, or --base-url for local models.'));
                    process.exit(1);
                } else {
                    // Local inference usually accepts any string as key
                    apiKey = 'dummy-key';
                }
            } else if (options.raw && !apiKey) {
                // Raw mode doesn't need a key
                apiKey = 'raw-mode-no-key';
            }

            const crawler = new Crawler(url);
            const processor = new Processor(apiKey, options.baseUrl, options.model);

            const spinner = ora('Initializing parser...').start();

            // 1. Parse (formerly Crawl)
            spinner.text = `Parsing ${url}...`;
            const pages = await crawler.crawl(parseInt(options.limit), (foundUrl) => {
                spinner.text = `Parsing... Found: ${foundUrl}`;
            });

            spinner.succeed(chalk.green(`Parsing complete! Found ${pages.length} pages.`));

            // 2. Process
            const outputContent: string[] = [];

            // Header for context.md
            outputContent.push(`# Documentation Context\n\nCompiled by Moltext from ${url} at ${new Date().toISOString()}\n\n---\n\n`);

            // Update spinner text based on mode
            const spinnerMsg = options.raw
                ? 'Normalizing pages (Raw Mode)...'
                : 'Normalizing and compiling pages into agent-readable form...';

            const processSpinner = ora(spinnerMsg).start();

            // Process sequentially or in small batches to avoid Rate Limits
            const batchSize = 5;
            let processedCount = 0;

            for (let i = 0; i < pages.length; i += batchSize) {
                const batch = pages.slice(i, i + batchSize);
                const results = await Promise.all(batch.map(async (page) => {
                    // Pass the raw flag to the processor
                    const result = await processor.processPage(page, options.raw);
                    return result;
                }));

                outputContent.push(...results);
                processedCount += batch.length;

                const action = options.raw ? 'Processing' : 'Compiling';
                processSpinner.text = `${action} pages... (${Math.min(processedCount, pages.length)}/${pages.length})`;
            }

            processSpinner.succeed(chalk.green('Compilation complete!'));

            // 3. Write
            const outputPath = path.resolve(process.cwd(), options.output);
            await fs.writeFile(outputPath, outputContent.join('\n'));

            console.log(chalk.bold.green(`\n✅ Success! Agentic context written to: ${outputPath}`));
            console.log(chalk.dim(`\nUsage tip: Drop this file into your Moltbot's memory to fully understand "${url}".\n`));

        } catch (error) {
            console.error(chalk.red('\n❌ Fatal Error:'), (error as Error).message);
            process.exit(1);
        }
    });

program.parse(process.argv);
