export const repairQuotes = (line: string): { value: string; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedLine = line;
  
  // Fix unclosed quotes
  const quoteCount = (repairedLine.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repairs.push('Added missing closing quote');
    repairedLine = repairedLine + '"';
  }
  
  // Fix consecutive quotes
  repairedLine = repairedLine.replace(/""+/g, '"');
  
  return { value: repairedLine, repairs };
};

export const repairDelimiters = (line: string): { value: string; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedLine = line;
  
  // Fix multiple consecutive delimiters
  if (repairedLine.includes(',,')) {
    repairs.push('Fixed consecutive delimiters');
    repairedLine = repairedLine.replace(/,+/g, ',');
  }
  
  return { value: repairedLine, repairs };
};