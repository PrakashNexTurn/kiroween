/**
 * useForm Hook
 * 
 * Custom hook for form state management with validation
 * Requirements: 3.5, 12.3
 */

import { useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import type { ValidationRule, FieldErrors } from '../utils/validation';
import { validateSchema, hasErrors } from '../utils/validation';

/**
 * Form configuration
 */
export interface UseFormConfig<T extends Record<string, any>> {
  initialValues: T;
  validationSchema?: { [K in keyof T]?: ValidationRule<T[K]> };
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form state and handlers
 */
export interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: FieldErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: FormEvent) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

/**
 * Custom hook for form state management
 * 
 * @param config - Form configuration
 * @returns Form state and handlers
 * 
 * @example
 * const form = useForm({
 *   initialValues: { name: '', email: '' },
 *   validationSchema: {
 *     name: combine(required, minLength(3)),
 *     email: combine(required, email()),
 *   },
 *   onSubmit: async (values) => {
 *     await api.submit(values);
 *   },
 * });
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormConfig<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (field: keyof T) => {
      const rule = validationSchema[field];
      if (rule) {
        const result = rule(values[field]);
        if (!result.isValid) {
          setErrors((prev) => ({ ...prev, [field]: result.error }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
          });
        }
      }
    },
    [values, validationSchema]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const newErrors = validateSchema(values, validationSchema);
    setErrors(newErrors);
    return !hasErrors(newErrors);
  }, [values, validationSchema]);

  /**
   * Handle field value change
   */
  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        // Validate after state update
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as { [K in keyof T]: boolean }
      );
      setTouched(allTouched);

      // Validate form
      const isValid = validateForm();

      if (!isValid) {
        return;
      }

      // Submit form
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  /**
   * Set a field value programmatically
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Set a field error programmatically
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Set a field touched state programmatically
   */
  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Check if form is valid
   */
  const isValid = !hasErrors(errors);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
}
