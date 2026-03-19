import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { FaLanguage, FaPlay } from 'react-icons/fa';
import { OscratOrganizationRole } from '@oscrat/model';
import { useTeamData } from '@/hooks/useTeamData';
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
  onLanguageSelect: (languageCode: string, translations: Record<string, string> | null) => void;
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
  const otherLanguages: LanguageOption[] = SUPPORTED_LANGUAGES
    .filter((lang) => lang.code !== 'en')
    .map((lang) => ({
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
  onLanguageSelect,
}) => {
  const { t } = useTranslation('common');
  const { dataList, isListLoading, fetchDataItem } = useTeamData(teamSlug);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isStarting, setIsStarting] = useState(false);

  const namespaceKey = getTranslationNamespaceKey(teamRole, complianceType);
  const availableLanguages = useMemo(
    () => buildLanguageOptions(dataList, namespaceKey),
    [dataList, namespaceKey]
  );

  const handleStart = async () => {
    const langInfo = availableLanguages.find((l) => l.code === selectedLanguage);

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

  const selectedLang = availableLanguages.find((l) => l.code === selectedLanguage);

  return (
    <div className="bg-white dark:bg-base-200 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <FaLanguage className="text-2xl text-blue-600" />
        <h3 className="text-lg font-semibold">
          {t('oscrat.ui.compliance-translation.assessment-language')}
        </h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('oscrat.ui.compliance-translation.select-language')}
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <select
            className="select select-bordered w-full bg-white dark:bg-base-100"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isListLoading || isStarting}
          >
            {availableLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
                {!lang.available && ' (Not available)'}
              </option>
            ))}
          </select>
          {selectedLang && !selectedLang.available && (
            <p className="text-xs text-amber-600 mt-1">
              {t('oscrat.ui.compliance-translation.default-english')}
            </p>
          )}
        </div>

        <button
          type="button"
          className="btn btn-primary flex items-center gap-2"
          onClick={handleStart}
          disabled={isStarting || isListLoading}
        >
          <FaPlay />
          {t(
            isAssessmentStarted
              ? 'oscrat.ui.dashboard.continue-assessment'
              : 'oscrat.ui.dashboard.start-assessment'
          )}
        </button>
      </div>
    </div>
  );
};

export default AssessmentLanguageSelector;
