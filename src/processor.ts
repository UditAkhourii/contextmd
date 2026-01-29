
import TurndownService from 'turndown';
import { OpenAI } from 'openai';
import * as cheerio from 'cheerio';
import { Page } from './crawler';

export class Processor {
    private openai: OpenAI;
    private turndown: TurndownService;

    constructor(apiKey: string) {
        this.openai = new OpenAI({ apiKey });
        this.turndown = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced'
        });
    }

    private cleanHtml(html: string): string {
        const $ = cheerio.load(html);

        // Remove clutter
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('iframe').remove();
        $('noscript').remove();
        $('[role="navigation"]').remove();
        $('.nav').remove();
        $('.footer').remove();
        $('.sidebar').remove(); // Risk: might remove content if class naming is bad, but usually safe for docs sidebar

        // Get main content if possible
        const main = $('main').html() || $('article').html() || $('body').html() || '';
        return main;
    }

    async processPage(page: Page): Promise<string> {
        // 1. Clean HTML
        const cleanedHtml = this.cleanHtml(page.content);

        // 2. Convert to Markdown
        let markdown = this.turndown.turndown(cleanedHtml);

        // 3. Enhance with LLM
        // We use a cheap fast model for basic formatting/cleanup
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini', // Cost effective
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert technical writer optimizing documentation for AI Agents.
                        Your task is to rewrite the provided documentation Markdown to be:
                        1. Extremely high-density and concise.
                        2. Optimized for retrieval (keywords, clear logic).
                        3. Stripped of conversational filler ("In this tutorial you will...").
                        4. Strictly preserving ALL code blocks and technical constraints.
                        5. Formatted with clear headers.
                        
                        Input is a raw scrape. Fix broken markdown if any.
                        Return ONLY the refined markdown.`
                    },
                    {
                        role: 'user',
                        content: `URL: ${page.url}\nTitle: ${page.title}\n\nContent:\n${markdown}`
                    }
                ],
                temperature: 0.1,
            });

            return `## Source: [${page.title}](${page.url})\n\n${response.choices[0].message.content || markdown}\n\n---\n\n`;

        } catch (e) {
            // Fallback to raw markdown if OpenAI fails
            return `## Source: [${page.title}](${page.url})\n\n${markdown}\n\n---\n\n`;
        }
    }
}
