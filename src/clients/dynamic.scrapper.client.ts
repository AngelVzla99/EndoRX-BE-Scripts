import { Builder, Browser, WebDriver, By, until } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.ts";
import { LoggerClient } from "./logger.client.ts";

export interface ScrapedPage {
  html: string;
  finalUrl: string;
}

export class DynamicScrapperClient {
  private logger: LoggerClient;
  private driver: WebDriver | null = null;

  constructor() {
    this.logger = new LoggerClient();
  }

  private async getDriver(): Promise<WebDriver> {
    if (this.driver) {
      return this.driver;
    }

    const options = new chrome.Options();
    options.addArguments("--headless");
    options.addArguments("--no-sandbox");
    options.addArguments("--disable-dev-shm-usage");
    options.addArguments("--disable-gpu");
    options.addArguments("--window-size=1920,1080");
    options.addArguments(
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    this.logger.info("Initializing Chrome WebDriver");

    this.driver = await new Builder()
      .forBrowser(Browser.CHROME)
      .setChromeOptions(options)
      .build();

    return this.driver;
  }

  public async getPageHtml(url: string, waitTimeMs: number = 5000): Promise<ScrapedPage> {
    let driver: WebDriver | null = null;

    try {
      this.logger.info("Starting page scraping", { url, waitTimeMs });

      driver = await this.getDriver();

      await driver.get(url);
      this.logger.info("Page loaded, waiting for content", { url });

      await driver.sleep(waitTimeMs);

      await driver.wait(until.elementLocated(By.tagName("body")), 15000);

      const finalUrl = await driver.getCurrentUrl();
      const html = await driver.getPageSource();

      this.logger.info("Page scraped successfully", {
        url,
        finalUrl,
        htmlLength: html.length,
        redirected: finalUrl !== url,
      });

      return {
        html,
        finalUrl,
      };
    } catch (error) {
      this.logger.error("Error scraping page", {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to scrape page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async close(): Promise<void> {
    if (this.driver) {
      try {
        await this.driver.quit();
        this.driver = null;
        this.logger.info("Chrome WebDriver closed");
      } catch (error) {
        this.logger.error("Error closing WebDriver", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
}

