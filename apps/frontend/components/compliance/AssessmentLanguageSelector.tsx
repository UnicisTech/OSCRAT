import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { FaLanguage, FaPlay, FaRedo } from 'react-icons/fa';
import { OscratOrganizationRole } from '@oscrat/model';
import { useTeamData } from '@/hooks/useTeamData';
import { Button } from '@/components/shared';
import ConfirmationModal from '@/components/oscrat/versions/versionDetails/tabs/allTabs/repository/confirmationModal';
import {
  SUPPORTED_LANGUAGES,
  getTranslationNamespaceKey,
  buildTranslationDataKey,
} from '@/components/team/complianceTranslation';
import type { ComplianceType } from '@/lib/compliance/translations';

interface LanguageOption {
  code: string;
  label: string;
  available: boolean;
  hasCustomTranslation: boolean;
}

interface Props {
  teamSlug: string;
  teamRole: OscratOrganizationRole;
  complianceType: ComplianceType;
  isAssessmentStarted?: boolean;
  /**
   * When true the assessment has been completed and the selector switches
   * its primary button to "Reset assessment" (with confirmation) and locks
   * the language picker so the user can't pretend to start fresh without
   * first resetting.
   */
  isAssessmentCompleted?: boolean;
  /** Reset handler invoked after the user confirms the reset dialog. */
  onReset?: () => Promise<void> | void;
  onLanguageSelect: (
    languageCode: string,
    translations: Record<string, string> | null
  ) => void;
}

/**
 * Build available language options from uploaded translations.
 *
 * English is always available because we have built-in default translations.
 * Teams can upload custom English translations to override the defaults, which
 * is why English can also be marked as "custom" when uploaded.
 */
function buildLanguageOptions(
  dataList: Array<{ dataKey: string }> | undefined,
  namespaceKey: string
): LanguageOption[] {
  const prefix = `compliance:translation:${namespaceKey}:`;
  const uploadedLanguages = new Set(
    dataList
      ?.filter((d) => d.dataKey.startsWith(prefix))
      .map((d) => d.dataKey.slice(prefix.length)) ?? []
  );

  const hasCustomEnglish = uploadedLanguages.has('en');

  // English is always first and always available (default or custom)
  const englishOption: LanguageOption = {
    code: 'en',
    label: hasCustomEnglish ? 'English (Custom)' : 'English (Default)',
    available: true,
    hasCustomTranslation: hasCustomEnglish,
  };

  // Other languages are only available if uploaded
  const otherLanguages: LanguageOption[] = SUPPORTED_LANGUAGES.filter(
    (lang) => lang.code !== 'en'
  ).map((lang) => ({
    code: lang.code,
    label: lang.label,
    available: uploadedLanguages.has(lang.code),
    hasCustomTranslation: uploadedLanguages.has(lang.code),
  }));

  return [englishOption, ...otherLanguages];
}

const AssessmentLanguageSelector: React.FC<Props> = ({
  teamSlug,
  teamRole,
  complianceType,
  isAssessmentStarted = false,
  isAssessmentCompleted = false,
  onReset,
  onLanguageSelect,
}) => {
  const { t } = useTranslation('common');
  const { dataList, isListLoading, fetchDataItem } = useTeamData(teamSlug);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isStarting, setIsStarting] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetConfirm = async () => {
    if (!onReset) {
      setIsResetModalOpen(false);
      return;
    }
    setIsResetting(true);
    try {
      await onReset();
    } finally {
      setIsResetting(false);
      setIsResetModalOpen(false);
    }
  };

  const namespaceKey = getTranslationNamespaceKey(teamRole, complianceType);
  const availableLanguages = useMemo(
    () => buildLanguageOptions(dataList, namespaceKey),
    [dataList, namespaceKey]
  );

  const handleStart = async () => {
    const langInfo = availableLanguages.find(
      (l) => l.code === selectedLanguage
    );

    // Use default translations (null) if no custom translation uploaded
    if (!langInfo?.hasCustomTranslation) {
      onLanguageSelect(selectedLanguage, null);
      return;
    }

    // Fetch custom translations
    setIsStarting(true);
    try {
      const dataKey = buildTranslationDataKey(namespaceKey, selectedLanguage);
      const data = await fetchDataItem(dataKey);
      if (data?.payload) {
        onLanguageSelect(selectedLanguage, JSON.parse(data.payload));
        setIsStarting(false);
        return;
      }
    } catch {
      // Fall through to use default translations
    }
    onLanguageSelect(selectedLanguage, null);
    setIsStarting(false);
  };

  const selectedLang = availableLanguages.find(
    (l) => l.code === selectedLanguage
  );

  const isLanguageLocked = isAssessmentStarted || isAssessmentCompleted;

  return (
    <div className="bg-surface border-line rounded-card mb-6 border p-6">
      <div className="mb-4 flex items-center gap-3">
        <FaLanguage className="text-primary text-2xl" />
        <h3 className="text-h6 font-bold">
          {t('oscrat.ui.compliance-translation.assessment-language')}
        </h3>
      </div>

      <p className="text-b2 text-content-secondary mb-4">
        {t('oscrat.ui.compliance-translation.select-language')}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <select
            className="select select-bordered bg-surface w-full"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isListLoading || isStarting || isLanguageLocked}
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
                {!lang.available && ' (Not available)'}
              </option>
            ))}
          </select>
          {selectedLang && !selectedLang.available && !isLanguageLocked && (
            <p className="text-c1 text-warning mt-1">
              {t('oscrat.ui.compliance-translation.default-english')}
            </p>
          )}
          {isLanguageLocked && (
            <p className="text-content-muted mt-1 text-xs">
              {t('oscrat.ui.compliance-translation.language-locked')}
            </p>
          )}
        </div>

        {isAssessmentCompleted ? (
          <Button
            type="button"
            variant="secondary"
            startIcon={<FaRedo />}
            onClick={() => setIsResetModalOpen(true)}
            disabled={!onReset || isResetting}
            className="min-w-[210px] justify-center whitespace-nowrap"
          >
            {t('oscrat.ui.dashboard.reset-assessment')}
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            startIcon={<FaPlay />}
            onClick={handleStart}
            disabled={isStarting || isListLoading}
            className="min-w-[210px] justify-center whitespace-nowrap"
          >
            {t(
              isAssessmentStarted
                ? 'oscrat.ui.dashboard.continue-assessment'
                : 'oscrat.ui.dashboard.start-assessment'
            )}
          </Button>
        )}
      </div>

      <ConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => !isResetting && setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
        title={t('oscrat.ui.dashboard.reset-assessment-title')}
        message={t('oscrat.ui.dashboard.confirm-reset-assessment')}
        confirmText={t('oscrat.ui.dashboard.reset-assessment')}
        cancelText={t('cancel')}
        isLoading={isResetting}
        variant="warning"
      />
    </div>
  );
};

export default AssessmentLanguageSelector;
