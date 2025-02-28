import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert';

Given('I am on the homepage', async function() {
  await this.page.goto('http://localhost:5173');
  // Wait for the app to be loaded
  await this.page.waitForSelector('#root');
});

Then('I should see the app content', async function() {
  const root = await this.page.$('#root');
  assert(root, 'App content not found');
});

When('I click the button', async function() {
  // Find button containing "count is" text using evaluate
  const button = await this.page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button'))
      .find(button => button.textContent.includes('count is'));
  });
  assert(button, 'Button with "count is" text not found');
  await button.click();
});

Then('I should see the count increase to {string}', async function(count) {
  // Find button containing "count is" text using evaluate
  const button = await this.page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button'))
      .find(button => button.textContent.includes('count is'));
  });
  const buttonText = await this.page.evaluate(el => el.textContent, button);
  assert(buttonText.includes(`count is ${count}`), 
    `Expected count ${count} not found in button text: ${buttonText}`);
});

When('I type {string} into the text input', async function(text) {
  const input = await this.page.waitForSelector('#textInput');
  // Clear the input first
  await this.page.evaluate(el => el.value = '', input);
  await input.type(text);
});

When('I clear the text input', async function() {
  const input = await this.page.waitForSelector('#textInput');
  await this.page.evaluate(el => {
    el.value = '';
    // Need to trigger both events for React controlled inputs
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, input);
});

Then('I should see {string} displayed in the text value', async function(expectedText) {
  // Wait for the text value element and check its content
  const textValueSelector = '#textValue';
  await this.page.waitForSelector(textValueSelector);
  
  const textContent = await this.page.$eval(textValueSelector, el => el.textContent);
  assert.strictEqual(textContent, expectedText, 
    `Expected text "${expectedText}" but found "${textContent}"`);
}); 