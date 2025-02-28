interface Step {
  keyword: string;
  text: string;
}

interface CucumberWorld {
  [key: string]: any;
}

type StepImplementation = (this: CucumberWorld, ...args: any[]) => Promise<void> | void;
type HookImplementation = (this: CucumberWorld) => Promise<void> | void;

interface StepStore {
  given: Map<string, StepImplementation>;
  when: Map<string, StepImplementation>;
  then: Map<string, StepImplementation>;
}

interface Hooks {
  before: HookImplementation[];
  after: HookImplementation[];
}


const stepStore: StepStore = {
  given: new Map(),
  when: new Map(),
  then: new Map()
};

const hooks: Hooks = {
  before: [],
  after: []
};

// Default World class
export class World implements CucumberWorld {
  constructor() {}
}

// World constructor storage
let WorldConstructor: new () => CucumberWorld = World;

// Keep track of the last step type
let lastStepType: keyof StepStore = 'given';

// Convert Cucumber expression to regex pattern
const convertToRegex = (pattern: string): RegExp => {
  const regexPattern = pattern
    .replace(/{string}/g, '"([^"]*)"')
    .replace(/{(\w+)}/g, '([^\\s]*)');
  return new RegExp(`^${regexPattern}$`);
};

// Helper to find matching pattern and extract parameters
const findMatchingStep = (store: Map<string, StepImplementation>, text: string) => {
  for (const [pattern, implementation] of store.entries()) {
    if (typeof pattern === 'string') {
      const regex = convertToRegex(pattern);
      const match = text.match(regex);
      if (match) {
        const params = match.slice(1).filter(p => p !== undefined);
        return { implementation, params };
      }
    }
  }
  return null;
};

// Helper to add step definition with context
const addStepDefinition = (type: keyof StepStore, pattern: string, implementation: StepImplementation): void => {
  stepStore[type.toLowerCase() as keyof StepStore].set(pattern, implementation);
};

// Helper to find and execute step
const executeStep = async (context: World, type: string, text: string): Promise<void> => {
  // Handle 'and' by using the last step type
  const stepType = type.toLowerCase() === 'and' ? lastStepType : type.toLowerCase() as keyof StepStore;
  
  // Update last step type for next 'and'
  if (type.toLowerCase() !== 'and') {
    lastStepType = stepType as keyof StepStore;
  }
  
  const store = stepStore[stepType];
  const match = findMatchingStep(store, text);
  
  if (match) {
    const { implementation, params } = match;
    await implementation.apply(context, params);
  } else {
    console.warn(`No implementation found for ${type} "${text}"`);
  }
};

// Execute all registered before hooks
const executeBefore = async (context: World): Promise<void> => {
  for (const beforeHook of hooks.before) {
    await beforeHook.apply(context);
  }
};

// Execute all registered after hooks
const executeAfter = async (context: World): Promise<void> => {
  for (const afterHook of hooks.after) {
    await afterHook.apply(context);
  }
};

// Execute a complete scenario with hooks and steps
export const executeScenario = async (scenarioName: string, steps: Step[]): Promise<void> => {
  console.log(`\nExecuting Scenario: ${scenarioName}`);
  
  // Reset last step type at the start of each scenario
  lastStepType = 'given';
  
  // Create context using World constructor
  const context = new WorldConstructor();
  
  // Execute before hooks with shared context
  await executeBefore(context);
  
  try {
    // Execute scenario steps with shared context
    for (const step of steps) {
      const keyword = step.keyword.trim().toLowerCase();
      await executeStep(context, keyword, step.text);
    }
  } finally {
    // Execute after hooks with shared context (even if steps fail)
    await executeAfter(context);
  }
};

// Set custom World constructor
export const setWorldConstructor = (constructor: new () => World): void => {
  WorldConstructor = constructor;
};

// Convenience methods for adding steps
export const Given = (pattern: string, implementation: StepImplementation): void => 
  addStepDefinition('given', pattern, implementation);

export const When = (pattern: string, implementation: StepImplementation): void => 
  addStepDefinition('when', pattern, implementation);

export const Then = (pattern: string, implementation: StepImplementation): void => 
  addStepDefinition('then', pattern, implementation);

// Hook registration methods
export const Before = (implementation: HookImplementation): number => {
  hooks.before.push(implementation);
  return hooks.before.length;
};

export const After = (implementation: HookImplementation): number => {
  hooks.after.push(implementation);
  return hooks.after.length;
}; 