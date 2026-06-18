import React from 'react';
import { LuFileWarning, LuCheckCircle } from 'react-icons/lu';
import Button from '@/components/button';
import { useRouter } from 'next/router';
import { ResultProps } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { Divider } from '@/components/shared';
import { formatRiskLevel } from '@/utils/craForm';
import type { FormState } from '@/types/craForm';

interface ResultWithFormStateProps extends ResultProps {
  completedFormState?: FormState | null;
  productId?: string;
}

const Result: React.FC<ResultWithFormStateProps> = ({
  isEligible,
  onTryAgain,
  highestRiskLevel,
  teamSlug,
  completedFormState,
  productId,
}) => {
  const router = useRouter();
  const { t, ready } = useTranslation('common');
  const { data: session, status } = useSession();
  const isEditMode = !!productId;

  if (!ready) return null;

  const isAuthenticated = status === 'authenticated' && session;

  const handleLogin = () => {
    router.push('/auth/login');
  };
  const handleRegister = () => {
    router.push('/auth/join');
  };
  const handleTryAgain = () => {
    onTryAgain?.();
  };
  const handleAddProduct = () => {
    router.push(`/organization/${teamSlug}/products/add-product/cache`);
  };
  const handleGoHome = () => {
    if (isAuthenticated && teamSlug) {
      router.push(`/organization/${teamSlug}/dashboard`);
    } else {
      router.push('/auth/login');
    }
  };

  // Render buttons based on eligibility
  const renderEligibleButtons = () => {
    if (isAuthenticated) {
      return (
        <>
          <Button
            onClick={handleAddProduct}
            className="w-full sm:w-auto"
            text={t('oscrat.ui.add-product')}
            variant="primary"
          />
          <Button
            onClick={handleTryAgain}
            className="w-full sm:w-auto"
            text={t('oscrat.ui.try-again')}
            variant="secondary"
          />
        </>
      );
    }

    return (
      <>
        <Button
          onClick={handleRegister}
          className="w-full sm:w-auto"
          text={t('register')}
          variant="secondary"
        />
        <Button
          onClick={handleLogin}
          className="w-full sm:w-auto"
          text={t('log-in')}
          variant="primary"
        />
      </>
    );
  };

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center p-4 font-['Inter',_sans-serif]">
        <div className="bg-surface rounded-card w-full max-w-2xl border-2 p-8 text-center md:p-12 md:pb-0">
          <div className="mb-6">
            <LuCheckCircle className="text-success mx-auto h-16 w-16" />
          </div>

          <h1 className="text-content mb-4 text-2xl font-semibold md:text-3xl">
            {t('oscrat.ui.no-qualification-required')}
          </h1>

          <p className="text-content-secondary mb-8 text-sm md:text-base">
            {t('oscrat.ui.product-no-qualification-desc')}
            <br />
            {t('oscrat.ui.check-another-product-desc')}
          </p>

          <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Button
              onClick={handleGoHome}
              className="w-full sm:w-auto"
              text={t('oscrat.ui.go-home')}
              variant="secondary"
            />
            <Button
              onClick={handleTryAgain}
              className="w-full sm:w-auto"
              text={t('oscrat.ui.try-again')}
              variant="primary"
            />
          </div>
        </div>

        <p className="text-content-muted mt-8 max-w-2xl px-4 text-center text-xs">
          {t('oscrat.ui.self-assessment-note')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-surface shadow-16 rounded-card w-full max-w-2xl p-8 text-center md:p-12 md:pb-4">
        <div className="mb-6">
          <LuFileWarning className="text-warning mx-auto h-16 w-16" />
        </div>

        <h1 className="text-content mb-4 text-2xl font-semibold md:text-3xl">
          {isAuthenticated
            ? t('oscrat.ui.product-requires-assessment')
            : t('oscrat.ui.continue-eligibility-check')}
        </h1>

        <p className="text-content-secondary mb-6 text-sm md:text-base">
          {t('oscrat.ui.product-within-scope')}
          {highestRiskLevel && (
            <span className="text-content-secondary font-semibold">
              {formatRiskLevel(highestRiskLevel)}
            </span>
          )}
          .
          <br />
          {!isAuthenticated && t('oscrat.ui.log-in-or-register')}
        </p>

        <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          {renderEligibleButtons()}
        </div>

        <Divider />

        <p className="text-content-muted mb-2 mt-4 max-w-2xl px-4 text-center text-xs">
          {t('oscrat.ui.self-assessment-note')}
        </p>
      </div>
    </div>
  );
};

export default Result;
