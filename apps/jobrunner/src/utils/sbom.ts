import { $ } from 'zx';
import * as path from 'path';
import * as fs from 'fs';
import { SBOMSummary } from '@oscrat/model/types/sbom';

export async function generateSbom(
  repoDir: string
): Promise<{ syftJsonPath: string; cycloneDxXmlPath: string }> {
  const originalCwd = $.cwd;

  try {
    // Set working directory to the repo directory
    $.cwd = repoDir;

    const timestamp = Date.now();

    const syftJsonFileName = `sbom-${timestamp}.syft.json`;
    const cycloneDxXmlFileName = `sbom-${timestamp}.cyclonedx.xml`;

    const syftJsonPath = path.join(repoDir, syftJsonFileName);
    const cycloneDxXmlPath = path.join(repoDir, cycloneDxXmlFileName);

    console.log(`Generating SBOM for directory: ${repoDir}`);
    console.log(`Output files: ${syftJsonPath}, ${cycloneDxXmlPath}`);

    await $`syft ${repoDir} -o syft-json=${syftJsonPath} -o cyclonedx-xml=${cycloneDxXmlPath}`;

    if (!fs.existsSync(syftJsonPath)) {
      throw new Error(`Syft JSON SBOM file was not created at ${syftJsonPath}`);
    }
    if (!fs.existsSync(cycloneDxXmlPath)) {
      throw new Error(
        `CycloneDX XML SBOM file was not created at ${cycloneDxXmlPath}`
      );
    }

    console.log(`SBOM files generated successfully:`);
    console.log(`- Syft JSON: ${syftJsonPath}`);
    console.log(`- CycloneDX XML: ${cycloneDxXmlPath}`);

    return {
      syftJsonPath,
      cycloneDxXmlPath,
    };
  } catch (error: any) {
    throw new Error('Failed to generate SBOM');
  } finally {
    // Reset the working directory
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
    console.log(`Converting SBOM from ${inputPath} to ${outputPath}`);

    await $`syft convert ${inputPath} -o syft-json=${outputPath}`;

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Converted SBOM file was not created at ${outputPath}`);
    }

    console.log(`SBOM converted successfully to: ${outputPath}`);
  } catch (error: any) {
    throw new Error('Failed to convert SBOM file');
  } finally {
    // Reset the working directory
    $.cwd = originalCwd;
  }
}

export function analyzeSBOM(sbomJson: SyftSBOM): SBOMSummary {
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
}
