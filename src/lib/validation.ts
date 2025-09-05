// Validation utilities for user profile data

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }

  // Check if contains only digits, spaces, dashes, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Phone number can only contain numbers and basic formatting characters' };
  }

  // Remove all non-digit characters for length validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's a valid phone number (9-15 digits)
  if (cleanPhone.length < 9 || cleanPhone.length > 15) {
    return { isValid: false, error: 'Please enter a valid phone number (9-15 digits)' };
  }

  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  return { isValid: true };
};

export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: true }; // Address is optional
  }

  if (address.trim().length > 200) {
    return { isValid: false, error: 'Address must be less than 200 characters' };
  }

  return { isValid: true };
};

export const validateAllFields = (profile: {
  name: string;
  email: string;
  phone: string;
  address: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const nameValidation = validateName(profile.name);
  if (!nameValidation.isValid && nameValidation.error) {
    errors.name = nameValidation.error;
  }

  const emailValidation = validateEmail(profile.email);
  if (!emailValidation.isValid && emailValidation.error) {
    errors.email = emailValidation.error;
  }

  const phoneValidation = validatePhone(profile.phone);
  if (!phoneValidation.isValid && phoneValidation.error) {
    errors.phone = phoneValidation.error;
  }

  const addressValidation = validateAddress(profile.address);
  if (!addressValidation.isValid && addressValidation.error) {
    errors.address = addressValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
