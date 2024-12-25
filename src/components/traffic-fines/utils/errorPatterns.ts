export interface ErrorPattern {
  type: string;
  count: number;
  examples: string[];
}

export const incrementErrorPattern = (
  patterns: Record<string, ErrorPattern>,
  errorType: string,
  example: string,
  rawData: string
): void => {
  if (!patterns[errorType]) {
    patterns[errorType] = {
      type: errorType,
      count: 0,
      examples: []
    };
  }
  patterns[errorType].count++;
  if (patterns[errorType].examples.length < 3) {
    patterns[errorType].examples.push(example);
  }
};

export const generateErrorReport = (analysis: any): string => {
  if (!analysis?.patterns?.commonErrors) {
    return 'No errors to report';
  }

  const patterns = analysis.patterns.commonErrors as Record<string, ErrorPattern>;
  if (!patterns || Object.keys(patterns).length === 0) {
    return 'No errors to report';
  }

  return Object.values(patterns)
    .map((pattern: ErrorPattern) => {
      if (!pattern?.type) return '';
      const examples = pattern.examples || [];
      return `${pattern.type}: ${pattern.count} occurrences\n` +
        `Examples:\n${examples.map(ex => `  - ${ex}`).join('\n')}`;
    })
    .filter(report => report.length > 0)
    .join('\n\n');
};