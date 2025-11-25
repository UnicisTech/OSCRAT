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

// Safe patterns - alphanumeric with basic punctuation
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s\-_.,()'\u00C0-\u017F]*$/;
const SAFE_FREETEXT_REGEX = /^[a-zA-Z0-9\s\-_.,()':;@#&+/\\!?\n\r\u00C0-\u017F]*$/;
const SAFE_ACRONYM_REGEX = /^[a-zA-Z0-9\-_]+$/;
const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z0-9\-_]*$/;

// Common field schemas
export const nameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.name-required')
  .max(40, 'oscrat.ui.validation.name-too-long')
  .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'oscrat.ui.validation.name-invalid-chars');

export const organizationNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.organization-name-required')
  .max(100, 'oscrat.ui.validation.organization-name-too-long')
  .matches(SAFE_TEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const emailSchema = Yup.string()
  .trim()
  .lowercase()
  .email('oscrat.ui.validation.email-invalid')
  .test('domain-validation', 'oscrat.ui.validation.email-invalid-domain', function (value) {
    if (!value) return false;

    const [, domain] = value.split('@');
    if (!domain || !domain.includes('.')) return false;

    const parts = domain.split('.');
    if (parts.length < 2) return false;
    if (parts.some(part => part.length === 0)) return false;
    if (parts[parts.length - 1].length < 2) return false;

    return true;
  })
  .max(100, 'oscrat.ui.validation.email-too-long');


export const phoneSchema = Yup.string()
  .test('phone-validation', 'oscrat.ui.validation.phone-invalid', function(value) {
    if (!value) return true;
    
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
  .max(200, 'oscrat.ui.validation.postal-address-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const taxIdSchema = Yup.string()
  .trim()
  .test('tax-id-validation', 'oscrat.ui.validation.tax-id-invalid', function(value) {
    if (!value) return true;
    return validateTaxIDAgainstAllCountries(value);
  });

export const additionalInfoSchema = Yup.string()
  .trim()
  .max(500, 'oscrat.ui.validation.additional-info-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

export const productNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.product-name-required')
  .max(60, 'oscrat.ui.validation.product-name-too-long')
  .matches(SAFE_TEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const versionNameSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.version-required')
  .max(20, 'oscrat.ui.validation.version-max-length')
  .matches(SAFE_TEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const acronymSchema = Yup.string()
  .trim()
  .min(2, 'oscrat.ui.validation.acronym-min-length')
  .max(10, 'oscrat.ui.validation.acronym-max-length')
  .matches(SAFE_ACRONYM_REGEX, 'oscrat.ui.validation.invalid-characters');

export const productDescriptionSchema = Yup.string()
  .trim()
  .max(500, 'oscrat.ui.validation.description-max-length')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

// Generic reusable schemas for titles and descriptions
export const titleSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.title-required')
  .max(100, 'oscrat.ui.validation.title-too-long')
  .matches(SAFE_TEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const descriptionSchema = Yup.string()
  .trim()
  .max(500, 'oscrat.ui.validation.description-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });


export const advisoryIdSchema = Yup.string()
  .trim()
  .max(100, 'oscrat.ui.validation.advisory-id-too-long')
  .matches(SAFE_IDENTIFIER_REGEX, 'oscrat.ui.validation.invalid-characters');

// Incident-specific schemas
export const incidentScopeSchema = Yup.string()
  .trim()
  .min(1, 'oscrat.ui.validation.incident-scope-required')
  .max(500, 'oscrat.ui.validation.incident-scope-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters');

export const incidentActionsSchema = Yup.string()
  .trim()
  .max(1000, 'oscrat.ui.validation.incident-actions-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

// File description schema
export const fileDescriptionSchema = Yup.string()
  .trim()
  .max(200, 'oscrat.ui.validation.file-description-too-long')
  .matches(SAFE_FREETEXT_REGEX, 'oscrat.ui.validation.invalid-characters')
  .transform((value) => {
    if (!value) return value;
    return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
  });

export function sanitizeString(input: string): string {
  return DOMPurify.sanitize(input);
}
