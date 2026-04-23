import { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useDocumentationList } from '@/hooks/useDocumentation';
import { useSearchProducts } from '@/lib/api/hooks/oscrat/projects';
import { DocumentationStatus } from '@oscrat/model';
import { getTemplateContent, type TemplateType } from '@/constants/documentationTemplates';
import { extractErrorMessage } from '@/lib/utils';
import { titleSchema } from '@/lib/validation/inputs';

type Step = 'select' | 'editor';

interface UseCreateDocumentationWizardConfig {
  defaultProductId?: string;
  defaultVersionId?: string;
  onClose: () => void;
}

export function useCreateDocumentationWizard({
  defaultProductId,
  defaultVersionId,
  onClose,
}: UseCreateDocumentationWizardConfig) {
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
      router.push(`/organization/${slug}/documentation/${doc.id}`);
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
    onClose();
  };

  return {
    step,
    isProductLevel,
    template,
    productId,
    versionId,
    title,
    error,
    products,
    availableVersions,
    isCreating,
    defaultProductId,
    defaultVersionId,
    setTemplate,
    setTitle,
    setVersionId,
    handleLevelChange,
    handleProductChange,
    handleNext,
    handleBack,
    handleCreate,
    handleClose,
  };
}
