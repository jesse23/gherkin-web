// Simple store for step definitions and hooks
const stepStore = {
  given: new Map(),
  when: new Map(),
  then: new Map()
};

const hooks = {
  before: [],
  after: []
};

// Default World class
export class World {
  constructor() {}
}

// World constructor storage
let WorldConstructor = World;



// Convert Cucumber expression to regex pattern
const convertToRegex = (pattern) => {
  const regexPattern = pattern
    .replace(/{string}/g, '"([^"]*)"')
    .replace(/{(\w+)}/g, '([^\\s]*)');
  return new RegExp(`^${regexPattern}$`);
};

// Helper to find matching pattern and extract parameters
const findMatchingStep = (store, text) => {
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
const addStepDefinition = (type, pattern, implementation) => {
  stepStore[type.toLowerCase()].set(pattern, implementation);
};

// Helper to find and execute step
const executeStep = async (context, type, text) => {
  const store = stepStore[type.toLowerCase()];
  const match = findMatchingStep(store, text);
  
  if (match) {
    const { implementation, params } = match;
    await implementation.apply(context, params);
  } else {
    console.warn(`No implementation found for ${type} "${text}"`);
  }
};

// Execute all registered before hooks
const executeBefore = async (context) => {
  for (const beforeHook of hooks.before) {
    await beforeHook.apply(context);
  }
};

// Execute all registered after hooks
const executeAfter = async (context) => {
  for (const afterHook of hooks.after) {
    await afterHook.apply(context);
  }
};

// Execute a complete scenario with hooks and steps
export const executeScenario = async (scenarioName, steps) => {
  console.log(`\nExecuting Scenario: ${scenarioName}`);
  
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
export const setWorldConstructor = (constructor) => {
  WorldConstructor = constructor;
};

// Convenience methods for adding steps
export const Given = (pattern, implementation) => addStepDefinition('given', pattern, implementation);
export const When = (pattern, implementation) => addStepDefinition('when', pattern, implementation);
export const Then = (pattern, implementation) => addStepDefinition('then', pattern, implementation);

// Hook registration methods
export const Before = (implementation) => hooks.before.push(implementation);
export const After = (implementation) => hooks.after.push(implementation);