import React from 'react';
import AccountLayout from '../components/layouts/AccountLayout';
import TeamLayout from '../components/layouts/TeamLayout';
import ProductLayout from '../components/layouts/ProductLayout';
import VersionLayout from '../components/layouts/VersionLayout';
import CraLayout from '../components/layouts/CraLayout';

export function withCraLayout(page: React.ReactNode) {
  return <CraLayout>{page}</CraLayout>;
}

export function withAccountLayout(page: React.ReactNode) {
  return <AccountLayout>{page}</AccountLayout>;
}

export function withTeamLayout(page: React.ReactNode) {
  return <TeamLayout>{page}</TeamLayout>;
}

export function withProductLayout(page: React.ReactNode) {
  return <ProductLayout>{page}</ProductLayout>;
}

export function withProductDetailLayout(page: React.ReactNode) {
  return <VersionLayout>{page}</VersionLayout>;
}
