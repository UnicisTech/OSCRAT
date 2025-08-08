import type { OscratProductSummary } from '@oscrat/model';
import {
  OscratProductCategory,
  OscratProductType,
  OscratProductComplianceStatus,
} from '@oscrat/model';

export type ProductFilters = {
  category?: string;
  role?: string;
  openIncidents?: string;
  openVulnerabilities?: string;
  externalReporting?: string;
  status?: string;
};

export function matchesFilters(
  product: OscratProductSummary,
  filters: ProductFilters
): boolean {
  // Category filter
  if (filters.category && filters.category !== '') {
    if (product.productCategory !== filters.category) {
      return false;
    }
  }

  // Role (Product Type) filter
  if (filters.role && filters.role !== '') {
    if (product.type !== filters.role) {
      return false;
    }
  }

  // Open Incidents filter
  if (filters.openIncidents && filters.openIncidents !== '') {
    const hasOpenIncidents = product.openIncidents > 0;
    const shouldHaveIncidents = filters.openIncidents === 'true';
    if (shouldHaveIncidents !== hasOpenIncidents) {
      return false;
    }
  }

  // Open Vulnerabilities filter
  if (filters.openVulnerabilities && filters.openVulnerabilities !== '') {
    const hasOpenVulnerabilities = product.openVulnerabilities > 0;
    const shouldHaveVulnerabilities = filters.openVulnerabilities === 'true';
    if (shouldHaveVulnerabilities !== hasOpenVulnerabilities) {
      return false;
    }
  }

  // External reporting filter
  if (filters.externalReporting && filters.externalReporting !== '') {
    if (filters.externalReporting === 'None') {
      if (product.externalReportingAcronyms.length > 0) {
        return false;
      }
    } else {
      if (
        !product.externalReportingAcronyms.includes(filters.externalReporting)
      ) {
        return false;
      }
    }
  }

  // Status filter
  if (filters.status && filters.status !== '') {
    if (product.complianceStatus !== filters.status) {
      return false;
    }
  }

  return true;
}

export function generateFilterOptions(products: OscratProductSummary[]) {
  const uniqueExternalReporting = Array.from(
    new Set(products.flatMap((p) => p.externalReportingAcronyms))
  );

  return {
    category: Object.values(OscratProductCategory),
    role: Object.values(OscratProductType),
    openIncidents: ['true', 'false'],
    openVulnerabilities: ['true', 'false'],
    externalReporting: [...uniqueExternalReporting, 'None'].sort(),
    status: Object.values(OscratProductComplianceStatus),
  };
}

export function filterProducts(
  products: OscratProductSummary[],
  searchTerm: string,
  filters: ProductFilters
): OscratProductSummary[] {
  return products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((product) => matchesFilters(product, filters));
}
