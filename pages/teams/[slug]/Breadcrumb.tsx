import { Link } from 'react-daisyui';
import { useTranslation } from 'react-i18next';
import TeamLayout from '@/components/layouts/TeamLayout';
import AccountLayout from '@/components/layouts/AccountLayout';
import React from 'react';

const Breadcrumb = ({
  teamName,
  taskTitle,
  taskNumber,
  backTo,
}: {
  teamName: string;
  taskTitle: string;
  taskNumber: string;
  backTo?: string;
}) => {
  const { t } = useTranslation("common");

  return (
    <div className="breadcrumbs text-sm">
      <ul>
        <li>{teamName || t("Home")}</li>
        <li>
          <Link href={backTo || "/"}>{t("Tasks")}</Link>
        </li>
        <li>{`${taskNumber} - ${taskTitle}`}</li>
      </ul>
    </div>
  );
};

Breadcrumb.getLayout = function getLayout(page: React.ReactNode) {
  return (
    <AccountLayout>
      <TeamLayout>{page}</TeamLayout>
    </AccountLayout>
  );
};

export default Breadcrumb;
