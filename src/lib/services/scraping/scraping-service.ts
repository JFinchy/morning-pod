import { z } from "zod";

/**
 * Simple content scraping service
 *
 * @business-context For MVP, we use a simple approach to extract content
 *                   from URLs. This can be enhanced later with specialized
 *                   scrapers for different content types.
 */

export interface ScrapedContent {
  content: string;
  publishedAt?: string;
  source: string;
  title: string;
  url: string;
}

export class ScrapingService {
  /**
   * Scrape content from a URL
   *
   * @business-context Simple text extraction for MVP. Future versions
   *                   will include specialized scrapers for different sites.
   */
  async scrapeUrl(url: string): Promise<ScrapedContent> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MorningPod/1.0)",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Simple HTML parsing - extract title and basic content
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/iu);
      const title = titleMatch ? titleMatch[1].trim() : "Untitled";

      // Extract content from common content containers
      const contentPatterns = [
        /<article[^>]*>(.*?)<\/article>/giu,
        /<main[^>]*>(.*?)<\/main>/giu,
        /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/gi,
        /<div[^>]*class="[^"]*post[^"]*"[^>]*>(.*?)<\/div>/gi,
        /<body[^>]*>(.*?)<\/body>/giu,
      ];

      let content = "";
      for (const pattern of contentPatterns) {
        const match = html.match(pattern);
        if (match) {
          content = match[1];
          break;
        }
      }

      // Clean up HTML tags and extract text
      content = content
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/<style[^>]*>.*?<\/style>/gi, "")
        .replace(/<[^>]+>/gu, " ")
        .replace(/\s+/gu, " ")
        .trim();

      if (!content || content.length < 100) {
        throw new Error("Insufficient content extracted from URL");
      }

      // Extract domain as source
      const urlObj = new URL(url);
      const source = urlObj.hostname.replace("www.", "");

      return {
        content,
        publishedAt: new Date().toISOString(),
        source,
        title,
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
