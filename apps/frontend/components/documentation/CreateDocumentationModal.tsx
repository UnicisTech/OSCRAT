import React, { useState, useMemo } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import Modal from '@/components/shared/Modal';
import InputWithLabel from '@/components/shared/InputWithLabel';
import SelectWithLabel from '@/components/shared/SelectWithLabel';
import { useDocumentationList } from '@/hooks/useDocumentation';
import { useSearchProducts } from '@/lib/api/hooks/oscrat/projects';
import { DocumentationStatus } from '@oscrat/model';
import { getTemplateContent, getTemplateOptions, type TemplateType } from '@/constants/documentationTemplates';
import { extractErrorMessage } from '@/lib/utils';
import { titleSchema } from '@/lib/validation/inputs';

interface Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  defaultProductId?: string;
  defaultVersionId?: string;
}

type Step = 'select' | 'editor';

const CreateDocumentationModal: React.FC<Props> = ({
  visible,
  setVisible,
  defaultProductId,
  defaultVersionId,
}) => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query as { slug: string };
  const { createDocumentation, isCreating } = useDocumentationList(slug);
  const { data: products } = useSearchProducts(slug, { includeVersions: true });

  const [step, setStep] = useState<Step>('select');
  const [isProductLevel, setIsProductLevel] = useState<boolean>(!!defaultProductId);
  const [template, setTemplate] = useState<TemplateType>('empty');
  const [productId, setProductId] = useState<string>(defaultProductId || '');
  const [versionId, setVersionId] = useState<string>(defaultVersionId || '');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableVersions = useMemo(() => {
    if (!productId || !products) return [];
    const selectedProduct = products.find((p) => p.id === productId);
    return selectedProduct?.versions || [];
  }, [productId, products]);

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newIsProduct = e.target.value === 'PRODUCT';
    setIsProductLevel(newIsProduct);
    if (!newIsProduct) {
      setProductId('');
      setVersionId('');
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProductId(e.target.value);
    setVersionId('');
  };

  const handleNext = () => {
    if (isProductLevel && !productId) {
      setError(t('oscrat.ui.documentation.error.product-required'));
      return;
    }
    if (isProductLevel && productId && !versionId) {
      setError(t('oscrat.ui.documentation.error.version-required'));
      return;
    }
    setError(null);
    setStep('editor');
  };

  const handleBack = () => {
    setStep('select');
    setError(null);
  };

  const handleCreate = async () => {
    try {
      await titleSchema.validate(title.trim());
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        setError(t(validationError.message));
      }
      return;
    }

    try {
      const templateContent = template !== 'empty' ? getTemplateContent(template) : '';
      
      const doc = await createDocumentation({
        title: title.trim(),
        content: templateContent,
        productId: isProductLevel ? productId : undefined,
        versionId: isProductLevel && versionId ? versionId : undefined,
        status: DocumentationStatus.DRAFT,
      });

      toast.success(t('oscrat.ui.documentation.created'));
      handleClose();
      router.push(`/teams/${slug}/documentation/${doc.id}`);
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, t('error'));
      toast.error(t(errorMessage, { defaultValue: errorMessage }));
    }
  };

  const handleClose = () => {
    setStep('select');
    setIsProductLevel(!!defaultProductId);
    setTemplate('empty');
    setProductId(defaultProductId || '');
    setVersionId(defaultVersionId || '');
    setTitle('');
    setError(null);
    setVisible(false);
  };

  return (
    <Modal open={visible} close={handleClose}>
      <Modal.Header>{t('oscrat.ui.documentation.create')}</Modal.Header>

      <Modal.Body>
        {step === 'select' && (
          <div className="space-y-4">
            <SelectWithLabel
              name="level"
              label={t('oscrat.ui.documentation.level.label')}
              value={isProductLevel ? 'PRODUCT' : 'ORGANIZATION'}
              onChange={handleLevelChange}
              disabled={!!defaultProductId}
              options={[
                { value: 'ORGANIZATION', label: t('oscrat.ui.documentation.level.organization') },
                { value: 'PRODUCT', label: t('oscrat.ui.documentation.level.product') },
              ]}
              required
            />

            {isProductLevel && (
              <>
                <SelectWithLabel
                  name="productId"
                  label={t('product')}
                  value={productId}
                  onChange={handleProductChange}
                  disabled={!!defaultProductId}
                  options={[
                    { value: '', label: t('oscrat.ui.select-product') },
                    ...(products?.map((product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []),
                  ]}
                  required
                />

                {productId && (
                  <SelectWithLabel
                    name="versionId"
                    label={t('version')}
                    value={versionId}
                    onChange={(e) => setVersionId(e.target.value)}
                    disabled={!!defaultVersionId}
                    options={[
                      { value: '', label: t('oscrat.ui.select-version') },
                      ...availableVersions.map((version) => ({
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
              value={template}
              onChange={(e) => setTemplate(e.target.value as TemplateType)}
              options={getTemplateOptions()}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        {step === 'editor' && (
          <div className="space-y-4">
            <InputWithLabel
              name="title"
              label={t('title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('oscrat.ui.documentation.title-placeholder')}
              required
            />

            <div className="rounded-md bg-gray-50 p-3 text-sm">
              <p className="font-medium">{t('oscrat.ui.documentation.summary')}:</p>
              <ul className="mt-2 list-inside list-disc text-gray-600">
                <li>
                  {t('oscrat.ui.documentation.level.label')}: {t(`oscrat.ui.documentation.level.${isProductLevel ? 'product' : 'organization'}`)}
                </li>
                {isProductLevel && productId && (
                  <li>
                    {t('product')}: {products?.find((p) => p.id === productId)?.name}
                    {versionId && ` (v${availableVersions.find((v) => v.id === versionId)?.version})`}
                  </li>
                )}
                <li>
                  {t('oscrat.ui.documentation.template.label')}: {t(`oscrat.ui.documentation.template.${template === 'empty' ? 'empty' : template}`)}
                </li>
              </ul>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        {step === 'select' ? (
          <>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('cancel')}
            </Button>
            <Button
              type="button"
              color="primary"
              onClick={handleNext}
            >
              {t('next')}
            </Button>
          </>
        ) : (
          <>
            <Button type="button" variant="outline" onClick={handleBack}>
              {t('back')}
            </Button>
            <Button
              type="button"
              color="primary"
              loading={isCreating}
              onClick={handleCreate}
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
