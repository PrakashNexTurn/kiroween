/**
 * Form Validation Utilities
 * 
 * Provides validation functions and form state management
 * Requirements: 3.5, 12.3
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validation rule type
 */
export type ValidationRule<T = any> = (value: T) => ValidationResult;

/**
 * Field validation errors
 */
export type FieldErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * Validate that a value is not empty
 * 
 * @param value - The value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result
 */
export function required(value: any, fieldName: string = 'This field'): ValidationResult {
  if (value === null || value === undefined) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  if (Array.isArray(value) && value.length === 0) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }

  return { isValid: true };
}

/**
 * Validate minimum length
 * 
 * @param min - Minimum length
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function minLength(min: number, fieldName: string = 'This field'): ValidationRule<string> {
  return (value: string): ValidationResult => {
    if (!value || value.length < min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${min} characters`,
      };
    }
    return { isValid: true };
  };
}

/**
 * Validate maximum length
 * 
 * @param max - Maximum length
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function maxLength(max: number, fieldName: string = 'This field'): ValidationRule<string> {
  return (value: string): ValidationResult => {
    if (value && value.length > max) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${max} characters`,
      };
    }
    return { isValid: true };
  };
}

/**
 * Validate against a regex pattern
 * 
 * @param pattern - Regex pattern to match
 * @param errorMessage - Custom error message
 * @returns Validation function
 */
export function pattern(pattern: RegExp, errorMessage: string): ValidationRule<string> {
  return (value: string): ValidationResult => {
    if (value && !pattern.test(value)) {
      return {
        isValid: false,
        error: errorMessage,
      };
    }
    return { isValid: true };
  };
}

/**
 * Validate email format
 * 
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function email(fieldName: string = 'Email'): ValidationRule<string> {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern(emailPattern, `${fieldName} must be a valid email address`);
}

/**
 * Validate that value is not only whitespace
 * 
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function notOnlyWhitespace(fieldName: string = 'This field'): ValidationRule<string> {
  return (value: string): ValidationResult => {
    if (value && value.trim().length === 0) {
      return {
        isValid: false,
        error: `${fieldName} cannot be only whitespace`,
      };
    }
    return { isValid: true };
  };
}

/**
 * Validate numeric value
 * 
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function numeric(fieldName: string = 'This field'): ValidationRule<string | number> {
  return (value: string | number): ValidationResult => {
    if (value !== '' && value !== null && value !== undefined) {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) {
        return {
          isValid: false,
          error: `${fieldName} must be a number`,
        };
      }
    }
    return { isValid: true };
  };
}

/**
 * Validate minimum numeric value
 * 
 * @param min - Minimum value
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function minValue(min: number, fieldName: string = 'This field'): ValidationRule<number> {
  return (value: number): ValidationResult => {
    if (value < min) {
      return {
        isValid: false,
        error: `${fieldName} must be at least ${min}`,
      };
    }
    return { isValid: true };
  };
}

/**
 * Validate maximum numeric value
 * 
 * @param max - Maximum value
 * @param fieldName - Name of the field for error message
 * @returns Validation function
 */
export function maxValue(max: number, fieldName: string = 'This field'): ValidationRule<number> {
  return (value: number): ValidationResult => {
    if (value > max) {
      return {
        isValid: false,
        error: `${fieldName} must be at most ${max}`,
      };
    }
    return { isValid: true };
  };
}

/**
 * Combine multiple validation rules
 * 
 * @param rules - Array of validation rules
 * @returns Combined validation function
 */
export function combine<T>(...rules: ValidationRule<T>[]): ValidationRule<T> {
  return (value: T): ValidationResult => {
    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  };
}

/**
 * Validate an object against a schema
 * 
 * @param values - Object to validate
 * @param schema - Validation schema
 * @returns Object with field errors
 */
export function validateSchema<T extends Record<string, any>>(
  values: T,
  schema: { [K in keyof T]?: ValidationRule<T[K]> }
): FieldErrors<T> {
  const errors: FieldErrors<T> = {};

  for (const field in schema) {
    const rule = schema[field];
    if (rule) {
      const result = rule(values[field]);
      if (!result.isValid) {
        errors[field] = result.error;
      }
    }
  }

  return errors;
}

/**
 * Check if there are any validation errors
 * 
 * @param errors - Field errors object
 * @returns True if there are errors
 */
export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
