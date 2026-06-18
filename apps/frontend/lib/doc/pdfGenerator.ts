import type { TFunction } from 'next-i18next';
import type { FullDocData, SimpleDocData, DeclarationType } from './types';

interface PDFDocTranslations {
  simpleTitle: string;
  fullTitle: string;
  referenceNumber: string;
  productIdentification: string;
  productName: string;
  modelTypeNumber: string;
  productVersion: string;
  uniqueIdentification: string;
  manufacturer: string;
  name: string;
  address: string;
  authorisedRepresentative: string;
  declarationOfResponsibility: string;
  declarationResponsibilityText: string;
  objectOfDeclaration: string;
  statementOfConformity: string;
  standardsSpecifications: string;
  notifiedBodyInvolvement: string;
  additionalInformation: string;
  signature: string;
  signedForOnBehalf: string;
  placeAndDate: string;
  signatureLine: string;
  simpleDeclarationText: string;
  notProvided: string;
}

/**
 * Builds translation object for PDF generation
 */
export function buildPDFDocTranslations(t: TFunction): PDFDocTranslations {
  return {
    simpleTitle: t('oscrat.ui.doc.pdf.simple-title'),
    fullTitle: t('oscrat.ui.doc.pdf.full-title'),
    referenceNumber: t('oscrat.ui.doc.pdf.reference-number'),
    productIdentification: t('oscrat.ui.doc.pdf.product-identification'),
    productName: t('oscrat.ui.doc.pdf.product-name'),
    modelTypeNumber: t('oscrat.ui.doc.pdf.model-type-number'),
    productVersion: t('oscrat.ui.doc.pdf.product-version'),
    uniqueIdentification: t('oscrat.ui.doc.pdf.unique-identification'),
    manufacturer: t('oscrat.ui.doc.pdf.manufacturer'),
    name: t('oscrat.ui.doc.pdf.name'),
    address: t('oscrat.ui.doc.pdf.address'),
    authorisedRepresentative: t('oscrat.ui.doc.pdf.authorised-representative'),
    declarationOfResponsibility: t(
      'oscrat.ui.doc.pdf.declaration-of-responsibility'
    ),
    declarationResponsibilityText: t(
      'oscrat.ui.doc.pdf.declaration-responsibility-text'
    ),
    objectOfDeclaration: t('oscrat.ui.doc.pdf.object-of-declaration'),
    statementOfConformity: t('oscrat.ui.doc.pdf.statement-of-conformity'),
    standardsSpecifications: t('oscrat.ui.doc.pdf.standards-specifications'),
    notifiedBodyInvolvement: t('oscrat.ui.doc.pdf.notified-body-involvement'),
    additionalInformation: t('oscrat.ui.doc.pdf.additional-information'),
    signature: t('oscrat.ui.doc.pdf.signature'),
    signedForOnBehalf: t('oscrat.ui.doc.pdf.signed-for-on-behalf'),
    placeAndDate: t('oscrat.ui.doc.pdf.place-and-date'),
    signatureLine: t('oscrat.ui.doc.pdf.signature-line'),
    simpleDeclarationText: t('oscrat.ui.doc.pdf.simple-declaration-text'),
    notProvided: t('oscrat.ui.doc.pdf.not-provided'),
  };
}

interface GeneratePDFParams {
  declarationType: DeclarationType;
  simpleData: SimpleDocData;
  fullData: FullDocData;
  translations: PDFDocTranslations;
}

/**
 * Generates DoC PDF using jsPDF
 */
export async function generateDocPDF({
  declarationType,
  simpleData,
  fullData,
  translations,
}: GeneratePDFParams): Promise<Blob> {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = 20;

  if (declarationType === 'simple') {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(translations.simpleTitle, pageWidth / 2, y, { align: 'center' });
    y += 20;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const manufacturer =
      simpleData.manufacturerName || translations.notProvided;
    const simpleText = translations.simpleDeclarationText
      .replace('{{manufacturer}}', manufacturer)
      .replace('{{product}}', simpleData.productName)
      .replace('{{version}}', simpleData.versionName);

    const lines = doc.splitTextToSize(simpleText, contentWidth);
    doc.text(lines, margin, y);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(translations.fullTitle, pageWidth / 2, y, { align: 'center' });
    y += 15;

    const addSection = (title: string, content: string) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(
        content || translations.notProvided,
        contentWidth
      );
      doc.text(lines, margin, y);
      y += lines.length * 5 + 8;
    };

    addSection(`${translations.referenceNumber}:`, fullData.referenceNumber);
    addSection(
      `1. ${translations.productIdentification}`,
      `${translations.productName}: ${fullData.productName}\n${translations.modelTypeNumber}: ${fullData.modelNumber}\n${translations.productVersion}: ${fullData.versionName}\n${translations.uniqueIdentification}: ${fullData.uniqueIdentification}`
    );
    addSection(
      `2.a. ${translations.manufacturer}`,
      `${translations.name}: ${fullData.manufacturerName}\n${translations.address}: ${fullData.manufacturerAddress}`
    );
    addSection(
      `2.b. ${translations.authorisedRepresentative}`,
      `${translations.name}: ${fullData.authorisedRepName}\n${translations.address}: ${fullData.authorisedRepAddress}`
    );
    addSection(
      `3. ${translations.declarationOfResponsibility}`,
      translations.declarationResponsibilityText
    );
    addSection(
      `4. ${translations.objectOfDeclaration}`,
      fullData.productDescription
    );
    addSection(
      `5. ${translations.statementOfConformity}`,
      fullData.harmonisationLegislation
    );
    addSection(
      `6. ${translations.standardsSpecifications}`,
      fullData.standardsAndSpecs
    );
    addSection(
      `7. ${translations.notifiedBodyInvolvement}`,
      fullData.notifiedBodyInfo
    );
    addSection(
      `8. ${translations.additionalInformation}`,
      fullData.additionalInfo
    );

    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.text(translations.signature, margin, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${translations.signedForOnBehalf}: ${fullData.manufacturerName}`,
      margin,
      y
    );
    y += 6;
    doc.text(
      `${translations.placeAndDate}: ${fullData.placeAndDate}`,
      margin,
      y
    );
    y += 6;
    doc.text(`${translations.name}: ${fullData.signatoryName}`, margin, y);
    y += 6;
    doc.text(`Function: ${fullData.signatoryFunction}`, margin, y);
    y += 6;
    doc.text(
      `${translations.signatureLine}: ________________________`,
      margin,
      y
    );
  }

  return doc.output('blob');
}
