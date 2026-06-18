import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { FaDownload, FaUpload } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AccessControl } from '@/components/shared/AccessControl';
import Button from '@/components/button';
import { downloadJson } from '@/lib/utils/download';
import {
  TRANSLATION_NAMESPACES,
  SUPPORTED_LANGUAGES,
  buildTranslationDataKey,
  type TranslationNamespaceKey,
  type ExistingTranslation,
} from './constants';

interface UploadTranslationFormProps {
  upsertData: (dataKey: string, payload: string) => Promise<unknown>;
  fetchDataItem: (dataKey: string) => Promise<{ payload: string } | null>;
  fetchComplianceTemplate: (
    namespace: string
  ) => Promise<Record<string, string>>;
  existingTranslations: ExistingTranslation[];
  isLoading: boolean;
  isUpserting: boolean;
}

const UploadTranslationForm: React.FC<UploadTranslationFormProps> = ({
  upsertData,
  fetchDataItem,
  fetchComplianceTemplate,
  existingTranslations,
  isLoading,
  isUpserting,
}) => {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedNamespace, setSelectedNamespace] =
    useState<TranslationNamespaceKey>('team-manufacturer');
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const existingTranslation = useMemo(
    () =>
      existingTranslations.find(
        (tr) =>
          tr.namespace === selectedNamespace && tr.language === selectedLanguage
      ),
    [existingTranslations, selectedNamespace, selectedLanguage]
  );

  const handleDownloadTemplate = async () => {
    try {
      const template = await fetchComplianceTemplate(selectedNamespace);
      downloadJson(template, `${selectedNamespace}-template-en.json`);
      toast.success(t('oscrat.ui.compliance-translation.download-success'));
    } catch {
      toast.error(t('oscrat.ui.compliance-translation.download-error'));
    }
  };

  const handleDownloadExisting = async () => {
    if (!existingTranslation) return;
    try {
      const data = await fetchDataItem(existingTranslation.dataKey);
      if (data?.payload) {
        downloadJson(
          data.payload,
          `${selectedNamespace}-${selectedLanguage}.json`
        );
        toast.success(t('oscrat.ui.compliance-translation.download-success'));
      }
    } catch {
      toast.error(t('oscrat.ui.compliance-translation.download-error'));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const uploadedData = JSON.parse(text) as Record<string, string>;

      const templateData = await fetchComplianceTemplate(selectedNamespace);
      const templateKeys = Object.keys(templateData);
      const jsonKeys = Object.keys(uploadedData);

      if (!templateKeys.every((key) => jsonKeys.includes(key))) {
        toast.error(t('oscrat.ui.compliance-translation.invalid-json'));
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      await upsertData(
        buildTranslationDataKey(selectedNamespace, selectedLanguage),
        text
      );
      toast.success(t('oscrat.ui.compliance-translation.upload-success'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error(t('oscrat.ui.compliance-translation.invalid-json'));
      } else {
        toast.error(t('oscrat.ui.compliance-translation.upload-error'));
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <AccessControl resource="team" actions={['update']}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {t('oscrat.ui.compliance-translation.upload-new')}
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('oscrat.ui.compliance-translation.assessment-type')}
            </label>
            <select
              className="select select-bordered bg-surface w-full"
              value={selectedNamespace}
              onChange={(e) =>
                setSelectedNamespace(e.target.value as TranslationNamespaceKey)
              }
            >
              {Object.entries(TRANSLATION_NAMESPACES).map(
                ([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t('oscrat.ui.compliance-translation.language')}
            </label>
            <select
              className="select select-bordered bg-surface w-full"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {SUPPORTED_LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            size="m"
            startIcon={<FaDownload />}
            onClick={handleDownloadTemplate}
          >
            {t('oscrat.ui.compliance-translation.download-template')}
          </Button>

          {existingTranslation && (
            <Button
              type="button"
              variant="secondary"
              size="m"
              startIcon={<FaDownload />}
              onClick={handleDownloadExisting}
            >
              {t('oscrat.ui.compliance-translation.download-existing')}
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="primary"
            size="m"
            startIcon={<FaUpload />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUpserting}
          >
            {isUpserting
              ? t('oscrat.ui.uploading')
              : t('oscrat.ui.compliance-translation.upload-translation')}
          </Button>
        </div>

        <div className="text-content-muted text-xs">
          <p className="mb-1 font-medium">
            {t('oscrat.ui.compliance-translation.workflow-title')}
          </p>
          <ol className="flex list-inside list-decimal flex-col gap-1">
            <li>{t('oscrat.ui.compliance-translation.workflow-step-1')}</li>
            <li>{t('oscrat.ui.compliance-translation.workflow-step-2')}</li>
            <li>{t('oscrat.ui.compliance-translation.workflow-step-3')}</li>
            <li>{t('oscrat.ui.compliance-translation.workflow-step-4')}</li>
          </ol>
        </div>
      </div>
    </AccessControl>
  );
};

export default UploadTranslationForm;
