import * as Yup from 'yup';
import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';
import DOMPurify from 'isomorphic-dompurify';
import { stdnum } from 'stdnum';
import { passwordPolicies } from '@/lib/common';

function validateTaxIDAgainstAllCountries(taxID: string): boolean {
  for (const countryCode of Object.keys(stdnum)) {
    const countryValidators = stdnum[countryCode];

    for (const idType of Object.keys(countryValidators)) {
      const validator = countryValidators[idType];
      if (typeof validator.validate === 'function') {
        try {
          const validationResult = validator.validate(taxID);
          const isValid = typeof validationResult === 'boolean' 
            ? validationResult 
            : validationResult.isValid;

          if (isValid) {
            return true;
          }
        } catch {
          // ignore invalid cases
        }
      }
    }
  }

  return false;
}

// Common field schemas
export const nameSchema = Yup.string()
  .trim()
  .min(1, 'Required')
  .max(100, 'Too long');

export const organizationNameSchema = nameSchema;

export const emailSchema = Yup.string()
  .trim()
  .email('Invalid email format')
  .max(100, 'Too long');

export const phoneSchema = Yup.string()
  .test('phone-validation', 'Invalid phone number', function(value) {
    if (!value) return true; // Allow empty values, use .required() separately if needed
    
    const { parent } = this;
    const countryCode = parent.countryCode;
    
    if (!countryCode) return false;
    
    try {
      const phoneNumber = parsePhoneNumberFromString(value, countryCode);
      return phoneNumber ? isValidPhoneNumber(phoneNumber.number, countryCode) : false;
    } catch (error) {
      return false;
    }
  });

export const passwordSchema = Yup.string()
  .required('Password is required')
  .min(passwordPolicies.minLength, `Password must be at least ${passwordPolicies.minLength} characters`)
  .max(128, 'Password must be less than 128 characters')
  .test('password-policy', `Password must be at least ${passwordPolicies.minLength} characters`, function(value) {
    if (!value) return false; 
    return value.length >= passwordPolicies.minLength;
  });

export const postalAddressSchema = Yup.string().trim().min(1, 'Required');

export const taxIdSchema = Yup.string()
  .trim()
  .test('tax-id-validation', 'Invalid tax ID format', function(value) {
    if (!value) return true; // Allow empty values, use .required() separately if needed
    return validateTaxIDAgainstAllCountries(value);
  });

export const additionalInfoSchema = Yup.string()
  .trim()
  .max(500, 'Too long')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input);
}
