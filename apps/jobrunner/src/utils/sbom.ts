import { $ } from 'zx';
import * as path from 'path';
import * as fs from 'fs';
import { SBOMSummary } from '@oscrat/model/types/sbom';
import { JobError } from './JobError';
import { ERROR_CODES } from '@oscrat/model/constants/errorCodes';
import { translateError } from './errorTranslator';

export async function generateSbom(
  repoDir: string
): Promise<{ syftJsonPath: string; cycloneDxXmlPath: string }> {
  const originalCwd = $.cwd;

  try {
    $.cwd = repoDir;

    const timestamp = Date.now();
    const syftJsonPath = path.join(repoDir, `sbom-${timestamp}.syft.json`);
    const cycloneDxXmlPath = path.join(repoDir, `sbom-${timestamp}.cyclonedx.xml`);

    console.log(`[SBOM Generation] Starting for directory: ${repoDir}`);
    console.log(`[SBOM Generation] Output paths:`, { syftJsonPath, cycloneDxXmlPath });

    await $`syft ${repoDir} -o syft-json=${syftJsonPath} -o cyclonedx-xml=${cycloneDxXmlPath}`;

    // Validate output files
    if (!fs.existsSync(syftJsonPath)) {
      console.error(`[SBOM Generation] Syft JSON not created at ${syftJsonPath}`);
      throw new JobError(
        ERROR_CODES.SBOM_GENERATION_FAILED,
        `Syft JSON file was not created at ${syftJsonPath}`
      );
    }

    if (!fs.existsSync(cycloneDxXmlPath)) {
      console.error(`[SBOM Generation] CycloneDX XML not created at ${cycloneDxXmlPath}`);
      throw new JobError(
        ERROR_CODES.SBOM_GENERATION_FAILED,
        `CycloneDX XML file was not created at ${cycloneDxXmlPath}`
      );
    }

    console.log(`[SBOM Generation] Successfully generated both SBOM formats`);
    return { syftJsonPath, cycloneDxXmlPath };

  } catch (error: any) {
    throw translateError(
      'SBOM Generation',
      error,
      ERROR_CODES.SBOM_GENERATION_FAILED,
      'Failed to generate SBOM'
    );
  } finally {
    $.cwd = originalCwd;
  }
}

interface SyftArtifact {
  name: string;
  version?: string;
  type: string;
}

export interface SyftSBOM {
  artifacts: SyftArtifact[];
  source?: {
    target?: {
      userInput?: string;
    };
  };
  descriptor?: {
    version?: string;
    timestamp?: string;
  };
}

export async function convertSbomToSyftJson(
  inputPath: string,
  outputPath: string
): Promise<void> {
  const originalCwd = $.cwd;

  try {
    console.log(`[SBOM Conversion] Converting: ${inputPath} -> ${outputPath}`);

    await $`syft convert ${inputPath} -o syft-json=${outputPath}`;

    if (!fs.existsSync(outputPath)) {
      console.error(`[SBOM Conversion] Output file not created at ${outputPath}`);
      throw new JobError(
        ERROR_CODES.SBOM_CONVERSION_FAILED,
        `Converted file was not created at ${outputPath}`
      );
    }

    console.log(`[SBOM Conversion] Successfully converted to Syft JSON`);

  } catch (error: any) {
    throw translateError(
      'SBOM Conversion',
      error,
      ERROR_CODES.SBOM_CONVERSION_FAILED,
      'Failed to convert SBOM format'
    );
  } finally {
    $.cwd = originalCwd;
  }
}

export function analyzeSBOM(sbomJson: SyftSBOM): SBOMSummary {
  try {
    if (!sbomJson || typeof sbomJson !== 'object') {
      throw new Error('Invalid SBOM JSON structure');
    }

    const artifacts = sbomJson.artifacts || [];

    // Component Overview
    const totalComponents = artifacts.length;
    const packageTypeCount: Record<string, number> = {};

    artifacts.forEach((artifact) => {
      const type = artifact.type || 'unknown';
      packageTypeCount[type] = (packageTypeCount[type] || 0) + 1;
    });

    // All Packages (sorted alphabetically)
    const packages = artifacts
      .filter((artifact) => artifact.name)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((pkg) => ({
        name: pkg.name,
        version: pkg.version,
        type: pkg.type,
      }));

    return {
      overview: {
        totalComponents,
        packageTypes: Object.keys(packageTypeCount).length,
        sourceTarget: sbomJson.source?.target?.userInput || 'Unknown',
        scanDate: sbomJson.descriptor?.timestamp || new Date().toISOString(),
        syftVersion: sbomJson.descriptor?.version || 'Unknown',
      },
      packageTypes: packageTypeCount,
      packages,
    };
  } catch (error: any) {
    console.error('[SBOM Analysis] Analysis failed:', error.message);

    throw new JobError(
      ERROR_CODES.SBOM_ANALYSIS_FAILED,
      `SBOM analysis failed: ${error.message}`
    );
  }
}
