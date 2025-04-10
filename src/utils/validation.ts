// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (at least 8 characters, including number/special char)
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d|\W).{8,}$/;
  return passwordRegex.test(password);
};

// Username validation (alphanumeric, underscore, hyphen, 3-20 chars)
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

// Device name validation (2-30 chars)
export const isValidDeviceName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 30;
};

// Pet name validation (2-30 chars)
export const isValidPetName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 30;
};

// Time validation (HH:MM format)
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Date validation (YYYY-MM-DD format)
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Field required validation
export const isRequired = (value: string | number): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== undefined && value !== null;
};

// Numeric value validation
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value));
};

// Range validation
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

// WiFi SSID validation
export const isValidSSID = (ssid: string): boolean => {
  return ssid.trim().length >= 1 && ssid.trim().length <= 32;
};

// WiFi password validation
export const isValidWiFiPassword = (password: string): boolean => {
  return password.length >= 8;
};

// Validate form fields
export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export const validateForm = (
  fields: Record<string, any>,
  validations: Record<string, (value: any) => [boolean, string]>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.keys(validations).forEach((fieldName) => {
    const value = fields[fieldName];
    const [valid, errorMessage] = validations[fieldName](value);
    
    if (!valid) {
      errors[fieldName] = errorMessage;
      isValid = false;
    }
  });

  return {
    isValid,
    errors
  };
};
