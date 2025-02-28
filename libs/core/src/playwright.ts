interface Locator {
  click(): Promise<void>;
  toBeVisible(): Promise<boolean>;
  toContainText(text: string): Promise<boolean>;
  fill(value: string): Promise<void>;
}

interface PageObject {
  goto(url: string): Promise<void>;
  locator(selector: string): Locator;
  click(selector: string): Promise<void>;
}

interface BrowserContext {
  newPage(): PageObject;
}

interface Browser {
  newContext(): BrowserContext;
  close(): Promise<void>;
}

interface SelectorInfo {
  element: string;
  text?: string;
}

// Parse Playwright-style selectors
const parseSelector = (sel: string): SelectorInfo => {
  const hasTextMatch = sel.match(/^(.+):has-text\("([^"]+)"\)$/);
  if (hasTextMatch) {
    const [_, element, text] = hasTextMatch;
    return { element, text };
  }
  return { element: sel };
};

// Find element with text
const findElementWithText = (element: string, text: string): Element | null => {
  const elements = Array.from(document.querySelectorAll(element));
  const found = elements.find(el => el.textContent?.includes(text) ?? false);
  return found || null;
};

// Browser automation helpers
const createPageObject = (): PageObject => ({
  async goto(url: string): Promise<void> {
    console.log('page: goto', url, ' -- cannot implement this in browser for now');
  },
  
  locator(selector: string): Locator {
    const { element, text } = parseSelector(selector);
    
    return {
      async click(): Promise<void> {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        if (el instanceof HTMLElement) {
          el.click();
        }
      },
      
      async toBeVisible(): Promise<boolean> {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        return el !== null;
      },
      
      async toContainText(expectedText: string): Promise<boolean> {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          return el.value.includes(expectedText);
        }
        return el?.textContent?.includes(expectedText) ?? false;
      },

      async fill(value: string): Promise<void> {
        const el = text ? findElementWithText(element, text) : document.querySelector(element);
        // https://stackoverflow.com/questions/23892547/what-is-the-best-way-to-trigger-change-or-input-event-in-react-js
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set;
          nativeInputValueSetter?.call(el, value);
          const event = new Event('input', { bubbles: true });
          el.dispatchEvent(event);
        }
      }
    };
  },
  
  async click(selector: string): Promise<void> {
    return this.locator(selector).click();
  }
});

// Expect helper
export const expect = (locator: Locator) => ({
  async toBeVisible(): Promise<boolean> {
    return locator.toBeVisible();
  },
  
  async toContainText(text: string): Promise<boolean> {
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
  launch: (): Browser => ({
    newContext: (): BrowserContext => ({
      newPage: () => createPageObject()
    }),
    close: async (): Promise<void> => {
      console.log('🧹 Cleaned up browser resources');
    }
  })
}; 