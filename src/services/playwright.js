// Parse Playwright-style selectors
const parseSelector = (sel) => {
  const hasTextMatch = sel.match(/^(.+):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const [_, element, text] = hasTextMatch;
    return { element, text };
  }
  return { element: sel };
};

// Find element with text
const findElementWithText = (element, text) => {
  return Array.from(document.querySelectorAll(element))
    .find(el => el.textContent.includes(text));
};

// Browser automation helpers
const createPageObject = () => ({
  async goto(url) {
    console.log('page: goto', url, ' -- cannot implement this in browser for now');
  },
  locator(selector) {
    const { element, text } = parseSelector(selector);
    
    return {
      async click() {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        el?.click();
      },
      async toBeVisible() {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        return el !== null;
      },
      async toContainText(expectedText) {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        return el?.textContent.includes(expectedText) || false;
      }
    };
  },
  async click(selector) {
    return this.locator(selector).click();
  }
});


// Expect helper
export const expect = (locator) => ({
  async toBeVisible() {
    return locator.toBeVisible();
  },
  async toContainText(text) {
    const result = await locator.toContainText(text);
    if (result) {
      console.log('expect: toContainText result:', result);
    } else {
      console.error('expect: toContainText result:', result);
    }
    return result;
  }
}); 

export const chromium = {
  launch: () => ({
    newContext: () => ({
      newPage: () => createPageObject()
    }),
    close: () => {
      console.log('🧹 Cleaned up browser resources');
    }
  })
}