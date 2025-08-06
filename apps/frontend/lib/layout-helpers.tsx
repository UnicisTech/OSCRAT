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
 * Common layout pattern for product pages: AccountLayout > TeamLayout > ProductLayout
 */
export function withProductLayout(page: React.ReactNode) {
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

/**
 * Helper for AccountLayout only
 */
export function withAccountLayout(page: React.ReactNode) {
  return <AccountLayout>{page}</AccountLayout>;
}
