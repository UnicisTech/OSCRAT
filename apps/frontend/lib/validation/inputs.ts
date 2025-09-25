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
  .min(1, 'oscrat.ui.validation.name-required')
  .max(40, 'oscrat.ui.validation.name-too-long')
  .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'oscrat.ui.validation.name-invalid-chars');

export const organizationNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.organization-name-required')
  .max(30, 'oscrat.ui.validation.organization-name-too-long');

export const emailSchema = Yup.string()
  .trim()
  .lowercase()
  .email('oscrat.ui.validation.email-invalid')
  .test('domain-validation', 'oscrat.ui.validation.email-invalid-domain', function (value) {
    if (!value) return false;

    const [, domain] = value.split('@');
    if (!domain || !domain.includes('.')) return false;

    const parts = domain.split('.');
    // Must have at least 2 parts: e.g. "domain" + "tld"
    if (parts.length < 2) return false;

    // Each part must be non-empty, and last part (TLD) >= 2 chars
    if (parts.some(part => part.length === 0)) return false;
    if (parts[parts.length - 1].length < 2) return false;

    return true;
  })
  .max(100, 'oscrat.ui.validation.email-too-long');


export const phoneSchema = Yup.string()
  .test('phone-validation', 'oscrat.ui.validation.phone-invalid', function(value) {
    if (!value) return true; // Allow empty values, use .required() separately if needed
    
    const { parent } = this;
    const countryCode = parent.countryCode;
    
    if (!countryCode) return false;
    
    try {
      const phoneNumber = parsePhoneNumberFromString(value, countryCode);
      return phoneNumber ? isValidPhoneNumber(phoneNumber.number, countryCode) : false;
    } catch {
      return false;
    }
  });

export const passwordSchema = Yup.string()
  .required('oscrat.ui.validation.password-required')
  .min(passwordPolicies.minLength, 'oscrat.ui.validation.password-too-short')
  .max(128, 'oscrat.ui.validation.password-too-long')
  .test('password-policy', 'oscrat.ui.validation.password-too-short', function(value) {
    if (!value) return false; 
    return value.length >= passwordPolicies.minLength;
  });

export const postalAddressSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.postal-address-required')
  .max(100, 'oscrat.ui.validation.postal-address-too-long');

export const taxIdSchema = Yup.string()
  .trim()
  .test('tax-id-validation', 'oscrat.ui.validation.tax-id-invalid', function(value) {
    if (!value) return true; // Allow empty values, use .required() separately if needed
    return validateTaxIDAgainstAllCountries(value);
  });

export const additionalInfoSchema = Yup.string()
  .trim()
  .max(500, 'oscrat.ui.validation.additional-info-too-long')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

export const productNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.product-name-required')
  .max(40, 'oscrat.ui.validation.product-name-too-long');

export const versionNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.version-required')
  .max(20, 'oscrat.ui.validation.version-max-length');

export const acronymSchema = Yup.string()
  .trim()
  .min(2, 'oscrat.ui.validation.acronym-min-length')
  .max(10, 'oscrat.ui.validation.acronym-max-length');

export const productDescriptionSchema = Yup.string()
  .trim()
  .max(500, 'oscrat.ui.validation.description-max-length')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input);
}
