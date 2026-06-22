import React from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shared';
import Modal from '@/components/shared/Modal';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import {
  getTemplateOptions,
  DOCUMENTATION_TEMPLATES,
  type TemplateType,
} from '@/constants/documentationTemplates';
import { useCreateDocumentationWizard } from './hooks/useCreateDocumentationWizard';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  defaultProductId?: string;
  defaultVersionId?: string;
}

const CreateDocumentationModal: React.FC<Props> = ({
  visible,
  setVisible,
  defaultProductId,
  defaultVersionId,
}) => {
  const { t } = useTranslation('common');
  const requiredLabel = (labelText: string) => (
    <label className="text-content-secondary block text-sm font-medium">
      {labelText}
      <span className="text-danger ml-1">*</span>
    </label>
  );

  const wizard = useCreateDocumentationWizard({
    defaultProductId,
    defaultVersionId,
    onClose: () => setVisible(false),
  });

  return (
    <Modal open={visible} close={wizard.handleClose}>
      <Modal.Header>{t('oscrat.ui.documentation.create')}</Modal.Header>

      <Modal.Body>
        {wizard.step === 'select' && (
          <div className="space-y-4">
            <SelectWithLabel
              name="level"
              label={requiredLabel(t('oscrat.ui.documentation.level.label'))}
              value={wizard.isProductLevel ? 'PRODUCT' : 'ORGANIZATION'}
              onChange={wizard.handleLevelChange}
              disabled={!!defaultProductId}
              options={[
                {
                  value: 'ORGANIZATION',
                  label: t('oscrat.ui.documentation.level.organization'),
                },
                {
                  value: 'PRODUCT',
                  label: t('oscrat.ui.documentation.level.product'),
                },
              ]}
              required
            />

            {wizard.isProductLevel && (
              <>
                <SelectWithLabel
                  name="productId"
                  label={requiredLabel(t('product'))}
                  value={wizard.productId}
                  onChange={wizard.handleProductChange}
                  disabled={!!defaultProductId}
                  options={[
                    { value: '', label: t('oscrat.ui.select-product') },
                    ...(wizard.products?.map((product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []),
                  ]}
                  required
                />

                {wizard.productId && (
                  <SelectWithLabel
                    name="versionId"
                    label={requiredLabel(t('version'))}
                    value={wizard.versionId}
                    onChange={(e) => wizard.setVersionId(e.target.value)}
                    disabled={!!defaultVersionId}
                    options={[
                      { value: '', label: t('oscrat.ui.select-version') },
                      ...wizard.availableVersions.map((version) => ({
                        value: version.id,
                        label: version.version,
                      })),
                    ]}
                    required
                  />
                )}
              </>
            )}

            <SelectWithLabel
              name="template"
              label={t('oscrat.ui.documentation.template.label')}
              value={wizard.template}
              onChange={(e) =>
                wizard.setTemplate(e.target.value as TemplateType)
              }
              options={getTemplateOptions()}
            />

            {wizard.error && (
              <p className="text-danger text-sm">{wizard.error}</p>
            )}
          </div>
        )}

        {wizard.step === 'editor' && (
          <div className="space-y-4">
            <InputWithLabel
              name="title"
              label={requiredLabel(t('title'))}
              value={wizard.title}
              onChange={(e) => wizard.setTitle(e.target.value)}
              placeholder={t('oscrat.ui.documentation.title-placeholder')}
              maxLength={100}
              required
            />

            <div className="bg-surface-muted rounded-card p-3 text-sm">
              <p className="font-medium">
                {t('oscrat.ui.documentation.summary')}:
              </p>
              <ul className="text-content-secondary mt-2 list-inside list-disc">
                <li>
                  {t('oscrat.ui.documentation.level.label')}:{' '}
                  {t(
                    `oscrat.ui.documentation.level.${wizard.isProductLevel ? 'product' : 'organization'}`
                  )}
                </li>
                {wizard.isProductLevel && wizard.productId && (
                  <li>
                    {t('product')}:{' '}
                    {
                      wizard.products?.find((p) => p.id === wizard.productId)
                        ?.name
                    }
                    {wizard.versionId &&
                      ` (${wizard.availableVersions.find((v) => v.id === wizard.versionId)?.version})`}
                  </li>
                )}
                <li>
                  {t('oscrat.ui.documentation.template.label')}:{' '}
                  {DOCUMENTATION_TEMPLATES[wizard.template].name}
                </li>
              </ul>
            </div>

            {wizard.error && (
              <p className="text-danger text-sm">{wizard.error}</p>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {wizard.step === 'select' ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={wizard.handleClose}
            >
              {t('cancel')}
            </Button>
            <Button type="button" variant="primary" onClick={wizard.handleNext}>
              {t('next')}
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={wizard.handleBack}
            >
              {t('back')}
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={wizard.isCreating}
              onClick={wizard.handleCreate}
            >
              {t('create')}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default CreateDocumentationModal;
