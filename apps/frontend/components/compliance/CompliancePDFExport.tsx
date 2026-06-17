import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { ComplianceArea, ComplianceState } from '@/types/compliance';
import { saveAs } from 'file-saver';
import { CONFORMITY_STATUS } from '@/constants/conformityStatuses';
import type { PDFTranslations } from '@/lib/compliance/pdfTranslations';
import checklistTranslations from '@/locales/en/compliance-tech-doc-checklist.json';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2pt solid #3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1pt solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5pt solid #e5e7eb',
  },
  tableCol: {
    flex: 1,
    fontSize: 9,
    paddingRight: 8,
  },
  tableColSmall: {
    width: '15%',
    fontSize: 9,
  },
  badge: {
    padding: '3 6',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  badgeYellow: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  badgeGray: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  questionSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  question: {
    fontSize: 9,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  answer: {
    fontSize: 9,
    marginBottom: 3,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statBox: {
    width: '48%',
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartBarRow: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  chartLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  chartLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  chartLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 4,
  },
  chartLegendText: {
    fontSize: 8,
    color: '#374151',
  },
});

interface ChartBarSegment {
  label: string;
  value: number;
  color: string;
}

const BarChart = ({ segments, total }: { segments: ChartBarSegment[]; total: number }) => {
  if (total === 0) return null;

  return (
    <View>
      <View style={styles.chartBarRow}>
        {segments.map((seg, i) =>
          seg.value > 0 ? (
            <View
              key={i}
              style={{
                width: `${(seg.value / total) * 100}%`,
                backgroundColor: seg.color,
                height: '100%',
              }}
            />
          ) : null
        )}
      </View>
      <View style={styles.chartLegendRow}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.chartLegendItem}>
            <View style={[styles.chartLegendDot, { backgroundColor: seg.color }]} />
            <Text style={styles.chartLegendText}>
              {seg.label}: {seg.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

interface CompliancePDFDocumentProps {
  complianceData: ComplianceArea[];
  state: ComplianceState;
  productId: string;
  organizationName: string;
  productName?: string;
  translations: PDFTranslations;
  translateComplianceFn: (key: string) => string;
}

const CompliancePDFDocument: React.FC<CompliancePDFDocumentProps> = ({
  complianceData,
  state,
  organizationName,
  productName,
  translations: t,
  translateComplianceFn: tc,
}) => {
  const allRequirements = complianceData.flatMap(area => {
    const translate = area.areaType === 'checklist'
      ? (key: string) => (checklistTranslations as Record<string, string>)[key] ?? key
      : tc;
    return area.content.map(req => {
      const assessment = state.assessments.find(a => a.requirementId === req.reqId);
      const totalQuestions = req.questions.length;
      const answeredQuestions = assessment?.answers.length || 0;
      const completionPercentage = totalQuestions > 0
        ? Math.round((answeredQuestions / totalQuestions) * 100)
        : 0;
      const isEvaluated = assessment?.complianceStatus !== undefined;

      let conformityStatus: string = CONFORMITY_STATUS.NOT_EVALUATED;
      if (isEvaluated && assessment?.complianceStatus) {
        conformityStatus = assessment.complianceStatus;
      } else if (completionPercentage > 0 && completionPercentage < 100) {
        conformityStatus = `${CONFORMITY_STATUS.IN_EVALUATION} [${completionPercentage}%]`;
      }

      return {
        id: req.reqId,
        name: translate(req.requirement),
        areaName: translate(area.areaOfRequirements),
        areaType: area.areaType,
        isEvaluated,
        conformityStatus,
        completionPercentage,
        assessment,
        requirement: req,
      };
    });
  });

  const evaluatedCount = allRequirements.filter(r => r.isEvaluated).length;
  const notEvaluatedCount = allRequirements.length - evaluatedCount;
  const totalProgress = allRequirements.reduce((sum, req) => {
    return sum + (req.isEvaluated ? 100 : req.completionPercentage);
  }, 0);
  const overallProgress = allRequirements.length > 0 ? Math.round(totalProgress / allRequirements.length) : 0;

  const compliantCount = allRequirements.filter(r => r.conformityStatus === CONFORMITY_STATUS.FULLY_COMPLIANT).length;
  const partiallyCompliantCount = allRequirements.filter(r => r.conformityStatus === CONFORMITY_STATUS.PARTIALLY_COMPLIANT).length;
  const notCompliantCount = allRequirements.filter(r => r.conformityStatus === CONFORMITY_STATUS.NOT_COMPLIANT).length;
  const notApplicableCount = allRequirements.filter(r => r.conformityStatus === CONFORMITY_STATUS.NOT_APPLICABLE).length;
  const inEvaluationCount = allRequirements.filter(r => r.conformityStatus.startsWith(CONFORMITY_STATUS.IN_EVALUATION)).length;
  const notEvaluatedConformityCount = allRequirements.filter(
    (r) => r.conformityStatus === CONFORMITY_STATUS.NOT_EVALUATED
  ).length;

  const exportDate = new Date().toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const getStatusStyle = (status: string) => {
    if (status === CONFORMITY_STATUS.FULLY_COMPLIANT) return styles.badgeGreen;
    if (status === CONFORMITY_STATUS.PARTIALLY_COMPLIANT) return styles.badgeYellow;
    if (status === CONFORMITY_STATUS.NOT_COMPLIANT) return styles.badgeRed;
    if (status === CONFORMITY_STATUS.NOT_APPLICABLE) return styles.badgeGray;
    if (status === CONFORMITY_STATUS.NOT_EVALUATED) return styles.badgeGray;
    if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) return styles.badgeBlue;
    return styles.badgeGray;
  };

  // Mirrors the dashboard labels so the PDF reads "Compliant" (not the raw
  // "Fully compliant" enum) and stays consistent with the breakdown legend.
  const getConformityLabel = (status: string): string => {
    if (status === CONFORMITY_STATUS.FULLY_COMPLIANT) return t.compliant;
    if (status === CONFORMITY_STATUS.PARTIALLY_COMPLIANT) return t.partiallyCompliant;
    if (status === CONFORMITY_STATUS.NOT_COMPLIANT) return t.notCompliant;
    if (status === CONFORMITY_STATUS.NOT_APPLICABLE) return t.notApplicable;
    if (status === CONFORMITY_STATUS.NOT_EVALUATED) return t.notEvaluated;
    if (status.startsWith(CONFORMITY_STATUS.IN_EVALUATION)) {
      const suffix = status.slice(CONFORMITY_STATUS.IN_EVALUATION.length).trim();
      return suffix ? `${t.inEvaluation} ${suffix}` : t.inEvaluation;
    }
    return status;
  };

  const evaluationSegments: ChartBarSegment[] = [
    { label: t.evaluated, value: evaluatedCount, color: '#10b981' },
    { label: t.notEvaluated, value: notEvaluatedCount, color: '#ef4444' },
  ];

  const conformitySegments: ChartBarSegment[] = [
    { label: t.compliant, value: compliantCount, color: '#10b981' },
    { label: t.partiallyCompliant, value: partiallyCompliantCount, color: '#f59e0b' },
    { label: t.notCompliant, value: notCompliantCount, color: '#ef4444' },
    { label: t.notApplicable, value: notApplicableCount, color: '#9ca3af' },
    { label: t.inEvaluation, value: inEvaluationCount, color: '#3b82f6' },
    { label: t.notEvaluated, value: notEvaluatedConformityCount, color: '#d1d5db' },
  ];

  return (
    <Document>
      {/* Overview Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{t.reportTitle}</Text>
          {productName && <Text style={styles.subtitle}>{t.product}: {productName}</Text>}
          <Text style={styles.subtitle}>{t.organization}: {organizationName}</Text>
          <Text style={styles.subtitle}>{t.generated}: {exportDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.overallProgress}</Text>
          <Text style={styles.progressText}>{overallProgress}% {t.complete}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${overallProgress}%` }]} />
          </View>
          <Text style={styles.subtitle}>
            {evaluatedCount} {t.of} {allRequirements.length} {t.requirementsEvaluated}
          </Text>
        </View>

        {/* Visual Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.evaluationStatusChart}</Text>
          <BarChart segments={evaluationSegments} total={allRequirements.length} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.conformityBreakdownChart}</Text>
          <BarChart segments={conformitySegments} total={allRequirements.length} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.summaryStatistics}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.evaluated}</Text>
              <Text style={styles.statValue}>{evaluatedCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.notEvaluated}</Text>
              <Text style={styles.statValue}>{allRequirements.length - evaluatedCount}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.compliant}</Text>
              <Text style={styles.statValue}>{compliantCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.partiallyCompliant}</Text>
              <Text style={styles.statValue}>{partiallyCompliantCount}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.notCompliant}</Text>
              <Text style={styles.statValue}>{notCompliantCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t.notApplicable}</Text>
              <Text style={styles.statValue}>{notApplicableCount}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{t.page} 1 - {t.reportTitle}</Text>
      </Page>

      {/* Status Table Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.requirementsStatusSummary}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColSmall}>{t.id}</Text>
              <Text style={styles.tableCol}>{t.requirement}</Text>
              <Text style={{ width: '20%', fontSize: 9 }}>{t.area}</Text>
              <Text style={styles.tableColSmall}>{t.status}</Text>
              <Text style={styles.tableColSmall}>{t.conformity}</Text>
            </View>
            {allRequirements.map((req, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <Text style={styles.tableColSmall}>{req.id}</Text>
                <Text style={styles.tableCol}>{req.name}</Text>
                <Text style={{ width: '20%', fontSize: 9 }}>{req.areaName}</Text>
                <Text style={styles.tableColSmall}>
                  {req.isEvaluated ? t.evaluated : t.notEvaluated}
                </Text>
                <Text style={[styles.tableColSmall, getStatusStyle(req.conformityStatus)]}>
                  {getConformityLabel(req.conformityStatus)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>{t.page} 2 - {t.reportTitle}</Text>
      </Page>

      {/* Detailed Assessment Pages */}
      {allRequirements
        .filter(req => req.assessment && req.areaType !== 'checklist')
        .map((req, reqIndex) => (
          <Page key={reqIndex} size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.title}>{req.id}: {req.name}</Text>
              <Text style={styles.subtitle}>{t.area}: {req.areaName}</Text>
              <Text style={[styles.badge, getStatusStyle(req.conformityStatus)]}>
                {getConformityLabel(req.conformityStatus)}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.craReference}</Text>
              <Text style={styles.answer}>{req.requirement.craReference}</Text>
            </View>

            {req.requirement.hint && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t.hint}</Text>
                <Text style={styles.answer}>{tc(req.requirement.hint)}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.questionsAndAnswers}</Text>
              {req.requirement.questions.map((question, qIndex) => {
                const answer = req.assessment?.answers.find(a => a.questionId === question.questionId);
                return (
                  <View key={qIndex} style={styles.questionSection}>
                    <Text style={styles.question}>
                      Q{qIndex + 1}: {tc(question.questionText)}
                    </Text>
                    {answer && (
                      <>
                        <Text style={styles.answer}>
                          {t.answer}: {typeof answer.answer === 'boolean'
                            ? (answer.answer ? t.yes : t.no)
                            : answer.answer}
                        </Text>
                        {answer.additionalInformation && (
                          <Text style={styles.answer}>
                            {t.additionalInfo}: {answer.additionalInformation}
                          </Text>
                        )}
                        {answer.evidence && (
                          <Text style={styles.answer}>{t.evidence}: {t.evidenceAttached}</Text>
                        )}
                      </>
                    )}
                    {!answer && (
                      <Text style={[styles.answer, { color: '#9ca3af' }]}>
                        {t.noAnswerProvided}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>

            <Text style={styles.footer}>
              {t.page} {reqIndex + 3} - {req.id} {t.detailedAssessment}
            </Text>
          </Page>
        ))}
    </Document>
  );
};

export const exportComplianceToPDF = async (
  complianceData: ComplianceArea[],
  state: ComplianceState,
  productId: string,
  organizationName: string,
  productName: string | undefined,
  translations: PDFTranslations,
  translateComplianceFn: (key: string) => string,
  returnBlob: boolean = false
): Promise<Blob | void> => {
  const blob = await pdf(
    <CompliancePDFDocument
      complianceData={complianceData}
      state={state}
      productId={productId}
      organizationName={organizationName}
      productName={productName}
      translations={translations}
      translateComplianceFn={translateComplianceFn}
    />
  ).toBlob();

  if (returnBlob) {
    return blob;
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const namePart = productName
    ? productName.replace(/[^a-z0-9]/gi, '-')
    : organizationName.replace(/[^a-z0-9]/gi, '-');
  const filename = `compliance-assessment-${namePart}-${timestamp}.pdf`;
  saveAs(blob, filename);
};

export default CompliancePDFDocument;
