export interface Step {
  keyword: string;
  text: string;
}

export interface CucumberWorld {
  [key: string]: any;
}

export type StepImplementation = (this: CucumberWorld, ...args: any[]) => Promise<void> | void;
export type HookImplementation = (this: CucumberWorld) => Promise<void> | void;

export interface StepStore {
  given: Map<string, StepImplementation>;
  when: Map<string, StepImplementation>;
  then: Map<string, StepImplementation>;
}

export interface Hooks {
  before: HookImplementation[];
  after: HookImplementation[];
}
