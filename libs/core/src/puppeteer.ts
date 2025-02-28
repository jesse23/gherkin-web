interface Locator {
  click(): Promise<void>;
  toBeVisible(): Promise<boolean>;
  toContainText(text: string): Promise<boolean>;
  fill(value: string): Promise<void>;
}

interface Browser {
  newPage(): Promise<Page>;
  close(): Promise<void>;
}

const triggerInputEvent = (element: HTMLElement, value: string): void => {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;
    nativeInputValueSetter?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

// Element Handle implementation
class ElementHandle {
  textContent: string | null;

  constructor(public element: HTMLElement) {
    if (!(element instanceof HTMLElement)) {
      throw new Error("Expected an HTMLElement");
    }
    this.textContent = element.textContent;
    this.element = element;
  }

  async click(): Promise<void> {
    this.element.click();
  }

  async type(text: string): Promise<void> {
    triggerInputEvent(this.element, text);
  }

  async getText(): Promise<string> {
    return this.element.innerText;
  }

  getAttribute(name: string): string | null {
    return this.element.getAttribute(name);
  }

  dispatchEvent(event: Event): void {
    this.element.dispatchEvent(event);
  }

  dispose(): void {
    this.element = null as any;
  }
}

// Page implementation
class Page {
  async goto(url: string): Promise<void> {
    console.log('page: goto', url);
  }

  async setViewport(options: { width: number; height: number }): Promise<void> {
    console.log('page: setViewport', options);
  }

  async waitForSelector(selector: string): Promise<ElementHandle> {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return new ElementHandle(element as HTMLElement);
  }

  async $(selector: string): Promise<ElementHandle | null> {
    const element = document.querySelector(selector);
    return element ? new ElementHandle(element as HTMLElement) : null;
  }

  async $eval<T>(selector: string, fn: (element: Element) => T): Promise<T> {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }
    return fn(element);
  }

  async evaluate<T>(fn: (() => T) | ((arg: any) => T), arg?: any): Promise<T> {
    return arg ? fn(arg) : (fn as () => T)();
  }

  async evaluateHandle<T>(fn: () => T): Promise<ElementHandle> {
    const result = fn();
    if (result instanceof Element) {
      return new ElementHandle(result as unknown as HTMLElement);
    }
    throw new Error('evaluateHandle must return an Element');
  }

  locator(selector: string): Locator {
    return {
      async click(): Promise<void> {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          element.click();
        }
      },

      async toBeVisible(): Promise<boolean> {
        return document.querySelector(selector) !== null;
      },

      async toContainText(text: string): Promise<boolean> {
        const element = document.querySelector(selector);
        if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
          return element.value.includes(text);
        }
        return element?.textContent?.includes(text) ?? false;
      },

      async fill(value: string): Promise<void> {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          triggerInputEvent(element, value);
        }
      }
    };
  }

  async click(selector: string): Promise<void> {
    return this.locator(selector).click();
  }
}

// Expect helper
export const expect = (locator: Locator) => ({
  async toBeVisible(): Promise<boolean> {
    return locator.toBeVisible();
  },

  async toContainText(text: string): Promise<boolean> {
    const result = await locator.toContainText(text);
    console[result ? 'log' : 'error']('expect: toContainText result:', result);
    return result;
  }
});

// Export mock Puppeteer
export default {
  launch: async (options?: { headless?: boolean; slowMo?: number }): Promise<Browser> => {
    console.log('puppeteer: launch', options);
    return {
      async newPage(): Promise<Page> {
        return new Page();
      },
      async close(): Promise<void> {
        console.log('🧹 Cleaned up browser resources');
      }
    };
  }
}; 
