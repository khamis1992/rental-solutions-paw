export const parseImportErrors = (errors: any) => {
  try {
    if (typeof errors === 'string') {
      errors = JSON.parse(errors);
    }
    return {
      skipped: errors.skipped || [],
      failed: errors.failed || [],
    };
  } catch (e) {
    console.error('Error parsing import errors:', e);
    return {
      skipped: [],
      failed: [],
    };
  }
};

export const validateCsvFile = (file: File): boolean => {
  if (file.type !== "text/csv") {
    return false;
  }
  return true;
};