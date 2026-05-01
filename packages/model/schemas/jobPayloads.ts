import * as Yup from 'yup';
import type { InferType } from 'yup';

export const repoGenerateSbomPayloadSchema = Yup.object({
  repositoryId: Yup.string().required('Repository ID is required'),
  reportId: Yup.string().required('Report ID is required'),
});

export const fileImportSbomPayloadSchema = Yup.object({
  filename: Yup.string().required('Filename is required'),
  fileId: Yup.string().required('File ID is required'),
  mimeType: Yup.string().required('MIME type is required'),
  reportId: Yup.string().required('Report ID is required'),
});

export const repoScanVulnerabilitiesPayloadSchema = Yup.object({
  repositoryId: Yup.string().required('Repository ID is required'),
  reportId: Yup.string().required('Report ID is required'),
});

export const sbomReportScanVulnerabilitiesPayloadSchema = Yup.object({
  sbomReportId: Yup.string().required('SBOM report ID is required'),
  reportId: Yup.string().required('Report ID is required'),
});

export const processConfigurationScanPayloadSchema = Yup.object({
  filename: Yup.string().required('Filename is required'),
  fileId: Yup.string().required('File ID is required'),
  mimeType: Yup.string().required('MIME type is required'),
  reportId: Yup.string().required('Report ID is required'),
  format: Yup.string().oneOf(['ARF', 'XCCDF', 'OVAL']).required('Format is required'),
});

export type RepoGenerateSbomPayload = InferType<typeof repoGenerateSbomPayloadSchema>;
export type FileImportSbomPayload = InferType<typeof fileImportSbomPayloadSchema>;
export type RepoScanVulnerabilitiesPayload = InferType<typeof repoScanVulnerabilitiesPayloadSchema>;
export type SbomReportScanVulnerabilitiesPayload = InferType<typeof sbomReportScanVulnerabilitiesPayloadSchema>;
export type ProcessConfigurationScanPayload = InferType<typeof processConfigurationScanPayloadSchema>;
