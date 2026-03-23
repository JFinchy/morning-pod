import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import Parser from "rss-parser";
import { z } from "zod";

/**
 * Simple content scraping service
 *
 * @business-context For MVP, we use a simple approach to extract content
 *                   from URLs. This can be enhanced later with specialized
 *                   scrapers for different content types.
 *                   Now uses Mozilla Readability for professional-grade extraction.
 */

export interface ScrapedContent {
  content: string;
  publishedAt?: string;
  source: string;
  title: string;
  url: string;
}

export class ScrapingService {
  private rssParser: Parser;

  constructor() {
    this.rssParser = new Parser();
  }

  /**
   * Scrape content from a URL
   */
  async scrapeUrl(url: string): Promise<ScrapedContent> {
    // Try RSS first if it looks like a feed or as a fallback
    if (url.includes("rss") || url.includes("feed") || url.endsWith(".xml")) {
      try {
        const feed = await this.rssParser.parseURL(url);
        if (feed.items && feed.items.length > 0) {
          const latestItem = feed.items[0];
          const feedContent =
            latestItem.contentSnippet || latestItem.content || "";

          // If RSS has enough content, return it
          if (feedContent.length > 500) {
            return {
              content: feedContent.trim(),
              publishedAt: latestItem.pubDate || new Date().toISOString(),
              source: feed.title || new URL(url).hostname,
              title: latestItem.title || "Untitled RSS Item",
              url: latestItem.link || url,
            };
          } else {
            // Content is too short or missing (common with TLDR), follow link to scrape full HTML
            console.log(
              `RSS content too short (${feedContent.length} chars), following link: ${latestItem.link}`
            );
            if (latestItem.link) {
              const fullContent = await this.scrapeHtml(latestItem.link);
              return {
                ...fullContent,
                publishedAt: latestItem.pubDate || fullContent.publishedAt,
                source: feed.title || fullContent.source,
                title: latestItem.title || fullContent.title,
              };
            }
          }
        }
      } catch (e) {
        console.log(
          "Not an RSS feed or failed to parse, falling back to HTML scraping"
        );
      }
    }

    return this.scrapeHtml(url);
  }

  /**
   * Internal helper to scrape HTML content using Mozilla Readability
   */
  private async scrapeHtml(url: string): Promise<ScrapedContent> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; MorningPod/1.0; +https://morningpod.app)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const html = await response.text();

      // Check if the response is actually XML/RSS
      if (
        contentType.includes("xml") ||
        contentType.includes("rss") ||
        html.trim().startsWith("<?xml")
      ) {
        try {
          const feed = await this.rssParser.parseString(html);
          if (feed.items && feed.items.length > 0) {
            const latestItem = feed.items[0];
            const feedContent =
              latestItem.contentSnippet || latestItem.content || "";
            if (feedContent.length > 500) {
              return {
                content: feedContent.trim(),
                publishedAt: latestItem.pubDate || new Date().toISOString(),
                source: feed.title || new URL(url).hostname,
                title: latestItem.title || "Untitled RSS Item",
                url: latestItem.link || url,
              };
            }
          }
        } catch (e) {
          // Fall through to HTML scraping
        }
      }

      // Use JSDOM and Readability for robust extraction
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (
        !article ||
        !article.textContent ||
        article.textContent.length < 100
      ) {
        // Fallback: If Readability fails, try a manual text extraction as a last resort
        const textContent = dom.window.document.body.textContent || "";
        const cleanText = textContent.replace(/\s+/gu, " ").trim();

        if (cleanText.length < 100) {
          throw new Error("Insufficient content extracted from URL");
        }

        return {
          content: cleanText,
          publishedAt: new Date().toISOString(),
          source: new URL(url).hostname.replace("www.", ""),
          title: dom.window.document.title || "Untitled",
          url,
        };
      }

      return {
        content: article.textContent.replace(/\s+/gu, " ").trim(),
        publishedAt: new Date().toISOString(),
        source: article.siteName || new URL(url).hostname.replace("www.", ""),
        title: article.title || "Untitled",
        url,
      };
    } catch (error) {
      throw new Error(
        `Failed to scrape URL: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

/**
 * Factory function to create scraping service
 */
export function createScrapingService(): ScrapingService {
  return new ScrapingService();
}
