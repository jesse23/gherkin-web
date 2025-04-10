import { Parser, GherkinClassicTokenMatcher, AstBuilder } from '@cucumber/gherkin';
import * as messages from '@cucumber/messages';
import { executeScenario } from './cucumber';

const parser = new Parser(
  new AstBuilder(messages.IdGenerator.uuid()),
  new GherkinClassicTokenMatcher()
);

export async function executeGherkinFeature(featureContent: string): Promise<void> {
  const gherkinDocument = parser.parse(featureContent);
  
  if (!gherkinDocument.feature) {
    throw new Error('No feature found in Gherkin document');
  }

  for (const child of gherkinDocument.feature.children) {
    if (child.scenario) {
      await executeScenario(child.scenario.name, [...child.scenario.steps]);
    }
  }
} 