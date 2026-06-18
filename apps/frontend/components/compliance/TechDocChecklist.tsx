import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import {
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import {
  ComplianceArea,
  ComplianceRequirement,
  RequirementAssessment,
} from '@/types/compliance';
import { COMPLIANCE_STATUS } from '@/constants/conformityStatuses';
import { TECH_DOC_CHECKLIST_NAMESPACE } from '@/lib/compliance/translations';
import { Button } from '@/components/shared';

const CRA_ANNEX_URLS: Record<string, string> = {
  'Annex VII':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847#anx_VII',
  'Annex II':
    'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847#anx_II',
};

function getCraReferenceUrl(reference: string): string | null {
  for (const [annex, url] of Object.entries(CRA_ANNEX_URLS)) {
    if (reference.startsWith(annex)) return url;
  }
  return null;
}

const CraReferenceLink: React.FC<{ reference: string }> = ({ reference }) => {
  const url = getCraReferenceUrl(reference);
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-c1 text-primary bg-info-subtle hover:bg-info-subtle inline-flex flex-shrink-0 items-center gap-1 rounded px-2 py-1 font-mono transition-colors"
      >
        {reference}
        <FaExternalLinkAlt className="text-c2" />
      </a>
    );
  }
  return (
    <span className="text-c1 text-content-placeholder bg-surface-muted flex-shrink-0 rounded px-2 py-1 font-mono">
      {reference}
    </span>
  );
};

interface TechDocChecklistProps {
  area: ComplianceArea;
  existingAssessments: RequirementAssessment[];
  onSave: (assessments: RequirementAssessment[]) => void;
  onBack: () => void;
}

type ChecklistState = Record<string, boolean>;

function groupBySection(
  requirements: ComplianceRequirement[]
): Map<string, ComplianceRequirement[]> {
  const groups = new Map<string, ComplianceRequirement[]>();
  for (const req of requirements) {
    const section = req.section ?? '';
    const list = groups.get(section) ?? [];
    list.push(req);
    groups.set(section, list);
  }
  return groups;
}

function buildInitialState(
  requirements: ComplianceRequirement[],
  existingAssessments: RequirementAssessment[]
): ChecklistState {
  const state: ChecklistState = {};
  for (const req of requirements) {
    const existing = existingAssessments.find(
      (a) => a.requirementId === req.reqId
    );
    state[req.reqId] = existing?.answers[0]?.answer === true;
  }
  return state;
}

const TechDocChecklist: React.FC<TechDocChecklistProps> = ({
  area,
  existingAssessments,
  onSave,
  onBack,
}) => {
  const { t, ready } = useTranslation(['common', TECH_DOC_CHECKLIST_NAMESPACE]);
  const tr = (key: string) => t(key, { ns: TECH_DOC_CHECKLIST_NAMESPACE });

  const [checks, setChecks] = useState<ChecklistState>(() =>
    buildInitialState(area.content, existingAssessments)
  );

  const sections = useMemo(() => groupBySection(area.content), [area.content]);

  const checkedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = area.content.length;

  const handleToggle = (reqId: string) => {
    setChecks((prev) => ({ ...prev, [reqId]: !prev[reqId] }));
  };

  const handleSave = () => {
    const assessments: RequirementAssessment[] = area.content
      .filter((req) => checks[req.reqId])
      .map((req) => ({
        requirementId: req.reqId,
        requirementText: req.requirement,
        areaId: area.id,
        areaText: area.areaOfRequirements,
        answers: [
          {
            questionId: 'compliance-check',
            answer: true,
          },
        ],
        complianceStatus: COMPLIANCE_STATUS.FULLY_COMPLIANT,
        assessedAt: new Date().toISOString(),
      }));
    onSave(assessments);
  };

  if (!ready) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="tertiary"
            onClick={onBack}
            aria-label={t('back')}
            icon={<FaArrowLeft />}
          />
          <div>
            <h2 className="text-h5 text-content font-bold">
              {tr(area.areaOfRequirements)}
            </h2>
            <p className="text-b2 text-content-muted mt-1">
              {t('oscrat.ui.checklist-progress', {
                checked: checkedCount,
                total: totalCount,
              })}
            </p>
          </div>
        </div>
      </div>

      {Array.from(sections.entries()).map(([sectionKey, requirements]) => (
        <div
          key={sectionKey}
          className="border-line bg-surface rounded-card overflow-hidden border"
        >
          {sectionKey && (
            <div className="bg-surface-muted border-line-subtle border-b px-6 py-3">
              <h3 className="text-b2 text-content-secondary font-bold uppercase tracking-wide">
                {tr(sectionKey)}
              </h3>
            </div>
          )}
          <div className="divide-line-subtle divide-y">
            {requirements.map((req) => {
              const isChecked = checks[req.reqId] ?? false;
              return (
                <label
                  key={req.reqId}
                  className="hover:bg-surface-muted flex cursor-pointer items-start gap-4 px-6 py-4 transition-colors"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                    {isChecked ? (
                      <FaCheckCircle
                        className="text-success h-5 w-5 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggle(req.reqId);
                        }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggle(req.reqId)}
                        className="border-line text-primary focus:ring-primary h-5 w-5 cursor-pointer rounded"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-b2 ${
                        isChecked
                          ? 'text-content-muted line-through'
                          : 'text-content'
                      }`}
                    >
                      {tr(req.requirement)}
                    </p>
                  </div>
                  <CraReferenceLink reference={req.craReference} />
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <Button variant="primary" onClick={handleSave} startIcon={<FaSave />}>
          {t('oscrat.ui.save-checklist')}
        </Button>
      </div>
    </div>
  );
};

export default TechDocChecklist;
