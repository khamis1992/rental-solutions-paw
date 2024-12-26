/**
 * Validates if a string is a properly formatted UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Generates a valid UUID v4
 */
export const generateUUID = (): string => {
  return crypto.randomUUID();
};

/**
 * Validates and potentially fixes a UUID, returning the result and any error message
 */
export interface UUIDValidationResult {
  uuid: string | null;
  isValid: boolean;
  errorMessage?: string;
}

export const validateAndFixUUID = (uuid: string): UUIDValidationResult => {
  if (!uuid) {
    return {
      uuid: null,
      isValid: false,
      errorMessage: 'UUID is empty or undefined'
    };
  }

  if (isValidUUID(uuid)) {
    return {
      uuid,
      isValid: true
    };
  }

  // Generate a new UUID if the provided one is invalid
  const newUUID = generateUUID();
  return {
    uuid: newUUID,
    isValid: false,
    errorMessage: `Invalid UUID format: ${uuid}. Generated new UUID: ${newUUID}`
  };
};