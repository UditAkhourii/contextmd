
import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export interface Page {
    url: string;
    content: string; // HTML
    title: string;
}

export class Crawler {
    private visited = new Set<string>();
    private queue: string[] = [];
    private baseUrl: string;
    private domain: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        this.domain = new URL(baseUrl).hostname;
        this.queue.push(baseUrl);
    }

    private normalizeUrl(url: string, currentUrl: string): string | null {
        try {
            const absolute = new URL(url, currentUrl);
            // Only keep http(s)
            if (!['http:', 'https:'].includes(absolute.protocol)) return null;
            // Stay on domain
            if (absolute.hostname !== this.domain) return null;
            // Remove hash
            absolute.hash = '';
            return absolute.toString();
        } catch (e) {
            return null;
        }
    }

    async crawl(maxPages: number = 500, onUrlFound?: (url: string) => void): Promise<Page[]> {
        const pages: Page[] = [];
        
        while (this.queue.length > 0 && pages.length < maxPages) {
            const url = this.queue.shift()!;
            
            if (this.visited.has(url)) continue;
            this.visited.add(url);
            
            if (onUrlFound) onUrlFound(url);

            try {
                const { data, headers } = await axios.get(url, {
                    headers: { 'User-Agent': 'AgenticDocsConverter/1.0' },
                    timeout: 10000 
                });

                const contentType = headers['content-type'] || '';
                if (!contentType.includes('text/html')) continue;

                const $ = cheerio.load(data);
                const title = $('title').text() || url;
                
                // Extract links
                $('a').each((_, element) => {
                    const href = $(element).attr('href');
                    if (href) {
                        const normalized = this.normalizeUrl(href, url);
                        if (normalized && !this.visited.has(normalized) && !this.queue.includes(normalized)) {
                            this.queue.push(normalized);
                        }
                    }
                });

                pages.push({ url, content: data, title });

            } catch (error) {
                // console.error(`Failed to crawl ${url}: ${(error as Error).message}`);
                // Continue despite errors
            }
        }
        
        return pages;
    }
}
