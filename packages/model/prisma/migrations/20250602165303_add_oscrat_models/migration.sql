-- CreateEnum
CREATE TYPE "OscratOrganizationRole" AS ENUM ('MANUFACTURER', 'DISTRIBUTOR', 'IMPORTER', 'DATA_STEWARD');

-- CreateEnum
CREATE TYPE "OscratOrganizationType" AS ENUM ('NATURAL_PERSON', 'LIMITED_LIABILITY_COMPANY', 'PUBLIC_LIMITED_COMPANY', 'PARTNERSHIP', 'OPEN_SOURCE_FOUNDATION', 'OPEN_SOURCE_STEWARD', 'NON_PROFIT_ORGANIZATION', 'ACADEMIC_INSTITUTION', 'PUBLIC_BODY', 'OTHER');

-- CreateEnum
CREATE TYPE "OscratOrganizationSize" AS ENUM ('MICROENTERPRISE', 'SMALL_ENTERPRISE', 'MEDIUM_ENTERPRISE', 'LARGE_ENTERPRISE', 'STARTUP');

-- CreateEnum
CREATE TYPE "OscratProductCategory" AS ENUM ('DEFAULT', 'IMPORTANT_CLASS_I', 'IMPORTANT_CLASS_II', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OscratProductRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OscratProductComplianceStatus" AS ENUM ('NOT_ASSESSED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT', 'PENDING_CERTIFICATION', 'CERTIFIED');

-- CreateEnum
CREATE TYPE "OscratProductType" AS ENUM ('CONNECTED_DEVICE', 'IOT_DEVICE', 'SMART_HOME_DEVICE', 'WEARABLE_DEVICE', 'INDUSTRIAL_DEVICE', 'SECURITY_HARDWARE', 'APPLICATION_SOFTWARE', 'SYSTEM_SOFTWARE', 'SECURITY_SOFTWARE', 'EMBEDDED_SOFTWARE', 'FIRMWARE', 'HARDWARE_WITH_SOFTWARE', 'REMOTE_DATA_PROCESSING');

-- CreateEnum
CREATE TYPE "OscratProductStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "OscratConformityProcedure" AS ENUM ('SELF_ASSESSMENT', 'THIRD_PARTY_OPTIONAL', 'THIRD_PARTY_MANDATORY', 'EUCC_CERTIFICATION');

-- CreateEnum
CREATE TYPE "OscratAssessmentType" AS ENUM ('CRA', 'ORG');

-- CreateEnum
CREATE TYPE "OscratProductVulnerabilitySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OscratProductVulnerabilityStatus" AS ENUM ('OPEN', 'ACTIVELY_EXPLOITED', 'PATCHED', 'MITIGATED', 'CLOSED', 'ACCEPTED_RISK');

-- CreateEnum
CREATE TYPE "OscratProductIncidentType" AS ENUM ('VULNERABILITY_EXPLOIT', 'PRODUCT_COMPROMISE', 'SUPPLY_CHAIN_INCIDENT', 'AUTHENTICATION_BYPASS', 'DATA_BREACH', 'DENIAL_OF_SERVICE', 'FIRMWARE_TAMPERING', 'CONFIGURATION_EXPLOIT', 'UPDATE_MECHANISM_FAILURE', 'CRYPTOGRAPHIC_FAILURE', 'NETWORK_INTRUSION', 'OTHER');

-- CreateEnum
CREATE TYPE "OscratProductIncidentStatus" AS ENUM ('NOT_REPORTED', 'INITIAL_ALERT_SENT', 'DETAILED_REPORT_SENT', 'FINAL_REPORT_SENT', 'REPORTING_COMPLETE');

-- CreateTable
CREATE TABLE "OscratOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OscratOrganizationType" NOT NULL,
    "size" "OscratOrganizationSize" NOT NULL,
    "roles" "OscratOrganizationRole"[],
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscratProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "OscratProductType" NOT NULL,
    "productCategory" "OscratProductCategory" NOT NULL DEFAULT 'DEFAULT',
    "complianceStatus" "OscratProductComplianceStatus" NOT NULL DEFAULT 'NOT_ASSESSED',
    "conformityProcedure" "OscratConformityProcedure" NOT NULL DEFAULT 'SELF_ASSESSMENT',
    "riskLevel" "OscratProductRiskLevel" NOT NULL DEFAULT 'LOW',
    "status" "OscratProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscratProductAssessment" (
    "id" TEXT NOT NULL,
    "type" "OscratAssessmentType" NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "OscratProductAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscratReportingOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "reportingEmail" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratReportingOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscratProductVulnerability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "OscratProductVulnerabilitySeverity" NOT NULL,
    "status" "OscratProductVulnerabilityStatus" NOT NULL,
    "cve" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratProductVulnerability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OscratProductIncident" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OscratProductIncidentType" NOT NULL,
    "status" "OscratProductIncidentStatus" NOT NULL,
    "incidentReference" TEXT,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,

    CONSTRAINT "OscratProductIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OscratProductToOscratReportingOrganization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_OscratProductToOscratReportingOrganization_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "OscratOrganization_teamId_key" ON "OscratOrganization"("teamId");

-- CreateIndex
CREATE INDEX "_OscratProductToOscratReportingOrganization_B_index" ON "_OscratProductToOscratReportingOrganization"("B");

-- AddForeignKey
ALTER TABLE "OscratOrganization" ADD CONSTRAINT "OscratOrganization_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratOrganization" ADD CONSTRAINT "OscratOrganization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratOrganization" ADD CONSTRAINT "OscratOrganization_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProduct" ADD CONSTRAINT "OscratProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OscratOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProduct" ADD CONSTRAINT "OscratProduct_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProduct" ADD CONSTRAINT "OscratProduct_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductAssessment" ADD CONSTRAINT "OscratProductAssessment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductAssessment" ADD CONSTRAINT "OscratProductAssessment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratReportingOrganization" ADD CONSTRAINT "OscratReportingOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OscratOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratReportingOrganization" ADD CONSTRAINT "OscratReportingOrganization_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratReportingOrganization" ADD CONSTRAINT "OscratReportingOrganization_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVulnerability" ADD CONSTRAINT "OscratProductVulnerability_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVulnerability" ADD CONSTRAINT "OscratProductVulnerability_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductVulnerability" ADD CONSTRAINT "OscratProductVulnerability_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_productId_fkey" FOREIGN KEY ("productId") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OscratProductIncident" ADD CONSTRAINT "OscratProductIncident_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OscratProductToOscratReportingOrganization" ADD CONSTRAINT "_OscratProductToOscratReportingOrganization_A_fkey" FOREIGN KEY ("A") REFERENCES "OscratProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OscratProductToOscratReportingOrganization" ADD CONSTRAINT "_OscratProductToOscratReportingOrganization_B_fkey" FOREIGN KEY ("B") REFERENCES "OscratReportingOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
