import React from 'react';
import { LuFileWarning, LuCheckCircle } from 'react-icons/lu';
import Button from '@/components/button';
import { useRouter } from 'next/navigation';
import { ResultProps } from '@oscrat/model';
import { useTranslation } from 'next-i18next';
import { useSession } from 'next-auth/react';
import { Divider } from '@/components/shared';
import { formatRiskLevel } from '@/utils/craForm';

const Result: React.FC<ResultProps> = ({
  isEligible,
  onTryAgain,
  highestRiskLevel,
  teamSlug,
}) => {
  const router = useRouter();
  const { t, ready } = useTranslation('common');
  const { data: session, status } = useSession();
  
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
    if (teamSlug) {
      router.push(`/teams/${teamSlug}/products/add-product/cache`);
    }
  };

  // Render buttons based on eligibility
  const renderEligibleButtons = () => {
    if (isAuthenticated) {
      return (
        <>
          <Button
            onClick={handleAddProduct}
            className="w-full rounded-lg bg-white px-8 py-3 font-medium transition-colors hover:bg-blue-50 sm:w-auto"
            text={t('oscrat.ui.add-product')}
            variant="normal"
          />
          <Button
            onClick={handleTryAgain}
            className="w-full rounded-lg px-8 py-3 font-medium text-white shadow-md transition-colors sm:w-auto"
            text={t('oscrat.ui.try-again')}
            variant="primary"
          />
        </>
      );
    }

    return (
      <>
      <Button
        onClick={handleRegister}
        className="w-full rounded-lg bg-white px-8 py-3 font-medium transition-colors hover:bg-blue-50 sm:w-auto"
        text={t('register')}
        variant="normal"
      />
      <Button
        onClick={handleLogin}
        className="w-full rounded-lg px-8 py-3 font-medium text-white shadow-md transition-colors sm:w-auto"
        text={t('log-in')}
        variant="primary"
      />
    </>
    );
  };

  if (!isEligible) {
    return (
      <div className="flex flex-col items-center justify-center p-4 font-['Inter',_sans-serif]">
        <div className="w-full max-w-2xl rounded-lg border-2 bg-white p-8 text-center md:p-12 md:pb-0">
          <div className="mb-6">
            <LuCheckCircle className="mx-auto h-16 w-16 text-green-500" />
          </div>
          
          <h1 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
            {t('oscrat.ui.no-qualification-required')}
          </h1>
          
          <p className="mb-8 text-sm text-gray-600 md:text-base">
            {t('oscrat.ui.product-no-qualification-desc')}
            <br />
            {t('oscrat.ui.check-another-product-desc')}
          </p>
          
          <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <>
    <Button
      onClick={handleLogin}
      className="w-full rounded-lg border border-black bg-white px-8 py-3 font-medium text-black transition-colors sm:w-auto"
      text={t('oscrat.ui.go-home')}
      variant="normal"
    />
    <Button
      onClick={handleTryAgain}
      className="hover:bg-pri w-full rounded-lg bg-blue-600 px-8 py-3 font-medium text-white shadow-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 sm:w-auto"
      text={t('oscrat.ui.try-again')}
      variant="primary"
    />
  </>
          </div>
        </div>
        
        <p className="mt-8 max-w-2xl px-4 text-center text-xs text-gray-500">
          {t('oscrat.ui.self-assessment-note')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-xl md:p-12 md:pb-4">
        <div className="mb-6">
          <LuFileWarning className="mx-auto h-16 w-16 text-orange-500" />
        </div>
        
        <h1 className="mb-4 text-2xl font-semibold text-gray-800 md:text-3xl">
          {t('oscrat.ui.continue-eligibility-check')}
        </h1>
        
        <p className="mb-6 text-sm text-gray-600 md:text-base">
          {t('oscrat.ui.product-within-scope')} 
          {highestRiskLevel && (
            <span className="font-semibold text-gray-700">
              {formatRiskLevel(highestRiskLevel)}
            </span>
          )}.
          <br />
          {t('oscrat.ui.log-in-or-register')}
        </p>
        
        <div className="mb-8 flex flex-col justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          {renderEligibleButtons()}
        </div>

        <Divider />

        <p className="mt-4 mb-2 max-w-2xl px-4 text-center text-xs text-gray-500">
        {t('oscrat.ui.self-assessment-note')}
      </p>
      </div>
      
   
    </div>
  );
};

export default Result;