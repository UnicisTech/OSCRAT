/**
 * Conformity assessment types for Declaration of Conformity
 */
export enum AssessmentType {
  SELF = 'self',
  EXTERNAL_BC = 'external-bc',
  EXTERNAL_H = 'external-h',
}

/**
 * Declaration type options
 */
export enum DeclarationType {
  SIMPLE = 'simple',
  FULL = 'full',
}

/**
 * Data for Simple Declaration of Conformity
 */
export interface SimpleDocData {
  manufacturerName: string;
  productName: string;
  versionName: string;
}

/**
 * Data for Full Declaration of Conformity
 */
export interface FullDocData {
  // Pre-filled (unchangeable)
  productName: string;
  versionName: string;
  manufacturerName: string;
  manufacturerAddress: string;
  // User-editable fields
  referenceNumber: string;
  modelNumber: string;
  uniqueIdentification: string;
  authorisedRepName: string;
  authorisedRepAddress: string;
  productDescription: string;
  harmonisationLegislation: string;
  standardsAndSpecs: string;
  notifiedBodyInfo: string;
  additionalInfo: string;
  placeAndDate: string;
  signatoryName: string;
  signatoryFunction: string;
}

/**
 * Prefill data from system
 */
export interface DocPrefillData {
  manufacturerName: string;
  manufacturerAddress: string;
  productName: string;
  versionName: string;
}
