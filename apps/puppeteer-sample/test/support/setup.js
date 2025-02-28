import { Before, After, setWorldConstructor } from '@cucumber/cucumber';
import puppeteer from 'puppeteer';

// Define custom world class
class CustomWorld {
  async openBrowser() {
    this.browser = await puppeteer.launch({
      headless: true, // Set to true in CI
      slowMo: 50 // Slow down operations for better visibility
    });
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1280, height: 800 });
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Set up hooks
Before(async function() {
  await this.openBrowser();
});

After(async function() {
  await this.closeBrowser();
});

// Set world constructor
setWorldConstructor(CustomWorld); 