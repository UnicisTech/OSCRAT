import React from 'react';
import AccountLayout from '../components/layouts/AccountLayout';
import TeamLayout from '../components/layouts/TeamLayout';
import ProductLayout from '../components/layouts/ProductLayout';
import VersionLayout from '../components/layouts/VersionLayout';

/**
 * Common layout pattern for team pages: AccountLayout > TeamLayout
 */
export function withTeamLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
}

/**
 * Layout pattern for product detail pages: AccountLayout > TeamLayout > ProductLayout
 */
export function withProductLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>
        <ProductLayout>{page}</ProductLayout>
      </TeamLayout>
    </AccountLayout>
  );
}

/**
 * Layout pattern for product detail pages: AccountLayout > TeamLayout > ProductLayout > VersionLayout
 */
export function withProductDetailLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>
        <ProductLayout>
          <VersionLayout>{page}</VersionLayout>
        </ProductLayout>
      </TeamLayout>
    </AccountLayout>
  );
}
