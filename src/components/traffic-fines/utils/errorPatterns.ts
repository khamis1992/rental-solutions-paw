import { ErrorPattern } from './types';

export const incrementErrorPattern = (
  patterns: Record<string, ErrorPattern>,
  type: string,
  example?: string
) => {
  if (!patterns[type]) {
    patterns[type] = { type, count: 0, examples: [] };
  }
  patterns[type].count++;
  if (example && patterns[type].examples.length < 3) {
    patterns[type].examples.push(example);
  }
  return patterns;
};

export const generateErrorReport = (patterns: Record<string, ErrorPattern>): string => {
  return Object.values(patterns)
    .map(pattern => 
      `${pattern.type}: ${pattern.count} occurrences\n` +
      `Examples:\n${pattern.examples.map(ex => `  - ${ex}`).join('\n')}`
    )
    .join('\n\n');
};