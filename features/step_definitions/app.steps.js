import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I am on the homepage', async function() {
    await this.page.goto('http://localhost:5173'); // Assuming Vite's default port
});

Then('I should see the app content', async function() {
    await expect(this.page.locator('#root')).toBeVisible();
});

When('I click the button', async function() {
    await this.page.click('button:has-text("count is")');
});

Then('I should see the count increase to {string}', async function(count) {
    await expect(this.page.locator('button:has-text("count is")')).toContainText(`count is ${count}`);
}); 