import { useTranslation } from 'next-i18next';
import { docFormStyles } from '@/lib/doc/formStyles';
import type { FullDocData } from '@/lib/doc/types';
import { FormField, FormSection } from './FormSection';

interface FullDocTemplateProps {
  data: FullDocData;
  onChange: (data: FullDocData) => void;
}

export default function FullDocTemplate({ data, onChange }: FullDocTemplateProps) {
  const { t } = useTranslation('common');

  const handleChange = (field: keyof FullDocData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="max-h-[60vh] space-y-6 overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
      <h3 className="text-center text-lg font-bold uppercase text-gray-900 dark:text-white">
        {t('oscrat.ui.doc.full-declaration-title')}
      </h3>

      {/* Reference Number */}
      <FormField
        label={t('oscrat.ui.doc.reference-number')}
        value={data.referenceNumber}
        onChange={(v) => handleChange('referenceNumber', v)}
        placeholder="[Insert Unique Declaration Number]"
      />

      {/* Section 1: Product Identification */}
      <FormSection number="1" title={t('oscrat.ui.doc.product-identification')}>
        <FormField
          label={t('oscrat.ui.doc.product-name')}
          value={data.productName}
          readOnly
        />
        <FormField
          label={t('oscrat.ui.doc.model-number')}
          value={data.modelNumber}
          onChange={(v) => handleChange('modelNumber', v)}
          placeholder="[Insert Model Number, Type, or Batch/Serial Number Range]"
        />
        <FormField
          label={t('oscrat.ui.doc.product-version')}
          value={data.versionName}
          readOnly
        />
        <FormField
          label={t('oscrat.ui.doc.unique-identification')}
          value={data.uniqueIdentification}
          onChange={(v) => handleChange('uniqueIdentification', v)}
          placeholder="[Part number, SKU, EAN, GTIN]"
        />
      </FormSection>

      {/* Section 2a: Manufacturer */}
      <FormSection number="2.a" title={t('oscrat.ui.doc.manufacturer')}>
        <FormField label={t('name')} value={data.manufacturerName} readOnly />
        <FormField
          label={t('oscrat.ui.doc.full-postal-address')}
          value={data.manufacturerAddress}
          readOnly
        />
      </FormSection>

      {/* Section 2b: Authorised Representative */}
      <FormSection number="2.b" title={t('oscrat.ui.doc.authorised-representative')}>
        <FormField
          label={t('name')}
          value={data.authorisedRepName}
          onChange={(v) => handleChange('authorisedRepName', v)}
          placeholder="[Insert Full Legal Name of the Authorised Representative]"
        />
        <FormField
          label={t('oscrat.ui.doc.full-postal-address')}
          value={data.authorisedRepAddress}
          onChange={(v) => handleChange('authorisedRepAddress', v)}
          placeholder="[Insert Street, City, Postal Code, Country]"
        />
      </FormSection>

      {/* Section 3: Declaration of Responsibility */}
      <FormSection number="3" title={t('oscrat.ui.doc.declaration-of-responsibility')}>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('oscrat.ui.doc.declaration-responsibility-text')}
        </p>
      </FormSection>

      {/* Section 4: Object of the Declaration */}
      <FormSection number="4" title={t('oscrat.ui.doc.object-of-declaration')}>
        <FormField
          label={t('description')}
          value={data.productDescription}
          onChange={(v) => handleChange('productDescription', v)}
          placeholder="[Provide a clear description of the product with digital elements]"
          multiline
          rows={3}
        />
      </FormSection>

      {/* Section 5: Statement of Conformity */}
      <FormSection number="5" title={t('oscrat.ui.doc.statement-of-conformity')}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('oscrat.ui.doc.statement-conformity-intro')}
        </p>
        <FormField
          label={t('oscrat.ui.doc.harmonisation-legislation')}
          value={data.harmonisationLegislation}
          onChange={(v) => handleChange('harmonisationLegislation', v)}
          placeholder="[List any other relevant Union harmonisation legislation]"
          multiline
          rows={3}
        />
      </FormSection>

      {/* Section 6: Standards and Specifications */}
      <FormSection number="6" title={t('oscrat.ui.doc.standards-specifications')}>
        <FormField
          label=""
          value={data.standardsAndSpecs}
          onChange={(v) => handleChange('standardsAndSpecs', v)}
          placeholder={`Harmonised Standards: [EN XXX YYYY:202Z]
Common Specifications: [...]
Cybersecurity Certifications: [...]
Other Technical Specifications: [...]`}
          multiline
          rows={5}
        />
      </FormSection>

      {/* Section 7: Notified Body */}
      <FormSection number="7" title={t('oscrat.ui.doc.notified-body')}>
        <FormField
          label=""
          value={data.notifiedBodyInfo}
          onChange={(v) => handleChange('notifiedBodyInfo', v)}
          placeholder={`Notified Body Name and Number: [Name], [4-digit Number]
Conformity Assessment Procedure: [Module B + C, etc.]
Certificate Identification: [Certificate Number]`}
          multiline
          rows={4}
        />
      </FormSection>

      {/* Section 8: Additional Information */}
      <FormSection number="8" title={t('oscrat.ui.doc.additional-information')}>
        <FormField
          label=""
          value={data.additionalInfo}
          onChange={(v) => handleChange('additionalInfo', v)}
          placeholder="[Insert any other relevant information]"
          multiline
          rows={3}
        />
      </FormSection>

      {/* Signature Section */}
      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-600">
        <FormField
          label={t('oscrat.ui.doc.signed-for')}
          value={data.manufacturerName}
          readOnly
        />
        <FormField
          label={t('oscrat.ui.doc.place-and-date')}
          value={data.placeAndDate}
          onChange={(v) => handleChange('placeAndDate', v)}
          placeholder="[City, Country], [Date]"
        />
        <FormField
          label={t('oscrat.ui.doc.signatory-name')}
          value={data.signatoryName}
          onChange={(v) => handleChange('signatoryName', v)}
          placeholder="[Print Name of the Signatory]"
        />
        <FormField
          label={t('oscrat.ui.doc.signatory-function')}
          value={data.signatoryFunction}
          onChange={(v) => handleChange('signatoryFunction', v)}
          placeholder="[CEO, Head of Compliance, etc.]"
        />
        <div>
          <label className={docFormStyles.label}>{t('oscrat.ui.doc.signature')}</label>
          <div className="h-16 rounded-md border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
}
