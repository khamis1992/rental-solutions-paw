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

export const generateErrorReport = (analysis: any): string => {
  if (!analysis || !analysis.patterns || !analysis.patterns.commonErrors) {
    return 'No errors to report';
  }

  return Object.values(analysis.patterns.commonErrors)
    .map(pattern => 
      `${pattern.type}: ${pattern.count} occurrences\n` +
      `Examples:\n${(pattern.examples || []).map(ex => `  - ${ex}`).join('\n')}`
    )
    .join('\n\n');
};