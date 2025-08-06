import { useTranslation } from 'next-i18next';
import { BsExclamationCircleFill } from 'react-icons/bs';
import { getBorderClass } from '@/lib/borderUtils';
import { usePathname, useRouter } from 'next/navigation';
import type { OscratProductVersionSummary } from '@oscrat/model';
import React from 'react';

interface VersionProps {
  data: OscratProductVersionSummary;
  variant?: 'supported' | 'notSupported';
}

const Version: React.FC<VersionProps> = ({
  data,
  variant = 'supported',
}: VersionProps) => {
  const { t, ready } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();

  const handleShowMore = (versionId: string) => {
    router.push(`${pathname}/versions/${versionId}`);
  };

  if (!ready) return null;

  const { id, version: title, status } = data;

  console.log('dataaa', data);

  // If status is not supported, show simplified variant
  if (variant === 'notSupported') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <div className="flex flex-1 flex-col justify-center">
            <div className="font-bold text-black dark:text-gray-100">
              <div className="text-[16px]">{title}</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                {t('status')}
              </span>
              <span
                className={`inline-flex w-fit rounded-full px-2 py-1 text-sm font-semibold capitalize text-black ${
                  status === 'ACTIVE'
                    ? 'bg-green-100 dark:bg-green-900'
                    : status === 'ARCHIVED'
                      ? 'bg-red-100 dark:bg-red-900'
                      : status === 'DEPRECATED'
                        ? 'bg-gray-200 dark:bg-orange-900'
                        : 'bg-gray-100 dark:bg-gray-900'
                }`}
              >
                {status === 'DEPRECATED' ? 'not supported' : status}
              </span>
            </div>
          </div>

          <div className="ml-12 flex flex-1 justify-end font-medium text-gray-600">
            <button
              onClick={() => handleShowMore(id)}
              className="rounded border border-gray-400 px-6 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {t('oscrat.ui.show-more')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-400 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center">
        <div className="flex flex-1 flex-col justify-center">
          <div className="font-bold text-black dark:text-gray-100">
            <div className="text-[16px]">{title}</div>
          </div>
        </div>

        <div
          className="flex justify-between text-sm text-gray-700 dark:text-gray-300"
          style={{ width: '40%' }}
        >
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('status')}
            </span>
            <span
              className={`inline-flex w-fit rounded-full px-2 py-1 text-sm font-semibold capitalize text-black ${
                status === 'ACTIVE'
                  ? 'bg-green-100 dark:bg-green-900'
                  : status === 'ARCHIVED'
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-gray-100 dark:bg-gray-900'
              }`}
            >
              {status}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.incidents')}
            </span>
            <div
              className={`inline-flex font-semibold text-black dark:text-gray-100`}
            >
              {data.openIncidents > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                      data.openIncidents
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>{data.openIncidents} {t('oscrat.ui.open')}</p>
                </div>
              ) : (
                <p
                  className={`rounded-full border px-2 py-0.5 ${getBorderClass(
                      data.openIncidents
                  )}`}
                >
                  {t('oscrat.ui.none')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {t('oscrat.ui.vulnerabilities')}
            </span>
            <div
              className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}
            >
              {data.openVulnerabilities > 0 ? (
                <div
                  className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(
                      data.openVulnerabilities
                  )}`}
                >
                  <BsExclamationCircleFill className="text-red-600" />
                  <p>{data.openVulnerabilities} {t('oscrat.ui.open')}</p>
                </div>
              ) : (
                <p
                  className={`rounded-full border px-2 py-0.5 ${getBorderClass(
                      data.openVulnerabilities
                  )}`}
                >
                  {t('oscrat.ui.none')}
                </p>
              )}
            </div>
          </div>
        {/*  TODO: Wait for task implementation in DB*/}
        {/*  <div className="flex flex-col">*/}
        {/*    <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">*/}
        {/*      {t('oscrat.ui.tasks')}*/}
        {/*    </span>*/}
        {/*    <div*/}
        {/*      className={`inline-flex items-center gap-2 font-semibold text-black dark:text-gray-100`}*/}
        {/*    >*/}
        {/*      {openTasks > 0 ? (*/}
        {/*        <div*/}
        {/*          className={`flex items-center gap-2 rounded-full border px-2 py-0.5 ${getBorderClass(*/}
        {/*            openTasks*/}
        {/*          )}`}*/}
        {/*        >*/}
        {/*          <BsExclamationCircleFill className="text-blue-600" />*/}
        {/*          <p>{displayTasks}</p>*/}
        {/*        </div>*/}
        {/*      ) : (*/}
        {/*        <p*/}
        {/*          className={`rounded-full border px-2 py-0.5 ${getBorderClass(*/}
        {/*            openTasks*/}
        {/*          )}`}*/}
        {/*        >*/}
        {/*          {displayTasks}*/}
        {/*        </p>*/}
        {/*      )}*/}
        {/*    </div>*/}
        {/*  </div>*/}
        </div>

        <div className="ml-12 flex flex-1 justify-end font-medium text-gray-600">
          <button
            onClick={() => handleShowMore(id)}
            className="rounded border border-gray-400 px-6 py-1 text-sm hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            {t('oscrat.ui.show-more')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Version;
