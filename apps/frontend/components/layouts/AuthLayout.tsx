import app from '@/lib/app';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-20 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <Image
            src="/logo-oscrat.svg"
            className="mx-auto w-[268px]"
            alt={app.name}
            width={600}
            height={200}
          />
          {heading && (
            <h2 className="text-content mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
              {t(heading)}
            </h2>
          )}
          {description && (
            <p className="text-content-secondary text-center font-semibold">
              {t(description)}
            </p>
          )}
        </div>
        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
      </div>
    </>
  );
}
