export const parseCSV = (content: string) => {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {} as Record<string, string>);
  });
};

export const validateCSVHeaders = (headers: string[]) => {
  const requiredHeaders = [
    'Agreement Number',
    'License No',
    'full_name',
    'License Number',
    'Check-out Date',
    'Check-in Date',
    'Return Date',
    'STATUS'
  ];

  const missingHeaders = requiredHeaders.filter(
    header => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};