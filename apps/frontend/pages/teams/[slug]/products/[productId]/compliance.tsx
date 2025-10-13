import React, { useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { withProductLayout } from '@/lib/layout-helpers';
import { useTeamContext } from '@/context/TeamContext';
import { useProductContext } from '@/context/ProductContext';
import { Loading } from '@/components/shared';
import { ComplianceForm } from '@/components/compliance';
import { ComplianceArea } from '@/types/compliance';
import { OscratOrganizationRole } from '@oscrat/model';

import data3b from '@/components/compliance/jsons/3b.json';
import data4b from '@/components/compliance/jsons/4b.json';
import data5b from '@/components/compliance/jsons/5b.json';
import data7b from '@/components/compliance/jsons/7b.json';

const getComplianceDataForRole = (roles: OscratOrganizationRole[]): ComplianceArea[] => {
  if (roles.includes(OscratOrganizationRole.MANUFACTURER)) return data3b as ComplianceArea[];
  if (roles.includes(OscratOrganizationRole.IMPORTER)) return data4b as ComplianceArea[];
  if (roles.includes(OscratOrganizationRole.DISTRIBUTOR)) return data5b as ComplianceArea[];
  // data7b IS A PLACEHOLDER UNTIL THEY GIVE US A GOOD EXCEL FILE FOR IT 
  if (roles.includes(OscratOrganizationRole.DATA_STEWARD)) return data7b as ComplianceArea[];
  return data3b as ComplianceArea[];
};

const CompliancePage = () => {
  const { t, ready } = useTranslation('common');
  const { teamContext } = useTeamContext();
  const { productContext } = useProductContext();
  const [complianceData, setComplianceData] = useState<ComplianceArea[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const team = teamContext.team;
  const product = productContext.project;
  if (!product || !team) {
    return null;
  }
  const productId = product.id;

  useEffect(() => {
    setIsLoading(true);
    const data = getComplianceDataForRole(team.orgRoles);
    setComplianceData(data);
    setIsLoading(false);
  }, [team, productId]);

  if (!ready || isLoading || !complianceData) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t('oscrat.ui.compliance-assessment')}
        </h1>
        <p className="text-gray-600">
          {t('oscrat.ui.compliance-assessment-description', { 
            productName: product.name
          })}
        </p>
      </div>

      <ComplianceForm
        complianceData={complianceData}
        productId={productId}
        teamRole={team.orgRoles?.[0]}
        teamName={team.name}
        productName={product.name}
      />
    </div>
  );
};

CompliancePage.getLayout = withProductLayout;

export { getCommonServerSideProps as getServerSideProps } from '@/lib/server-helpers';

export default CompliancePage;
