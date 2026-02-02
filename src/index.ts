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
    .option('-k, --key <key>', 'API Key (optional if using local inference)')
    .option('-u, --base-url <url>', 'Base URL for the LLM (e.g. http://localhost:11434/v1)', 'https://api.openai.com/v1')
    .option('-m, --model <model>', 'Model name to use', 'gpt-4o-mini')
    .option('-o, --output <path>', 'Output file path', 'context.md')
    .option('-l, --limit <number>', 'Max pages to parse', '100')
    .action(async (url, options) => {
        try {
            console.log(chalk.bold.cyan('\n🚀 Moltext - Agent-Native Documentation Compiler\n'));

            // If base-url is not default OpenAI, we can allow empty key (assuming local/no-auth)
            let apiKey = options.key || process.env.OPENAI_API_KEY;

            if (!apiKey) {
                if (options.baseUrl.includes('api.openai.com')) {
                    console.error(chalk.red('❌ Error: API Key is required for OpenAI. Provide it via -k flag or OPENAI_API_KEY env var.'));
                    process.exit(1);
                } else {
                    // Placeholder for local inference
                    apiKey = 'dummy-key';
                }
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

            const processSpinner = ora('Normalizing and compiling pages into agent-readable form...').start();

            // Process sequentially or in small batches to avoid Rate Limits
            const batchSize = 5;
            let processedCount = 0;

            for (let i = 0; i < pages.length; i += batchSize) {
                const batch = pages.slice(i, i + batchSize);
                const results = await Promise.all(batch.map(async (page) => {
                    const result = await processor.processPage(page);
                    return result;
                }));

                outputContent.push(...results);
                processedCount += batch.length;
                processSpinner.text = `Compiling pages... (${Math.min(processedCount, pages.length)}/${pages.length})`;
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
