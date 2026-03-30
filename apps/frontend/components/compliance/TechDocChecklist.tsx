import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { FaArrowLeft, FaSave, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import {
  ComplianceArea,
  ComplianceRequirement,
  RequirementAssessment,
} from '@/types/compliance';
import { COMPLIANCE_STATUS } from '@/constants/conformityStatuses';
import { TECH_DOC_CHECKLIST_NAMESPACE } from '@/lib/compliance/translations';

const CRA_ANNEX_URLS: Record<string, string> = {
  'Annex VII': 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847#anx_VII',
  'Annex II': 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847#anx_II',
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
        className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
      >
        {reference}
        <FaExternalLinkAlt className="text-[10px]" />
      </a>
    );
  }
  return (
    <span className="flex-shrink-0 text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">
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
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={t('back')}
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {tr(area.areaOfRequirements)}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
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
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          {sectionKey && (
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                {tr(sectionKey)}
              </h3>
            </div>
          )}
          <div className="divide-y divide-gray-100">
            {requirements.map((req) => {
              const isChecked = checks[req.reqId] ?? false;
              return (
                <label
                  key={req.reqId}
                  className="flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="pt-0.5 flex-shrink-0">
                    {isChecked ? (
                      <FaCheckCircle
                        className="text-green-500 text-xl cursor-pointer"
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
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        isChecked
                          ? 'text-gray-500 line-through'
                          : 'text-gray-800'
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
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaSave />
          {t('oscrat.ui.save-checklist')}
        </button>
      </div>
    </div>
  );
};

export default TechDocChecklist;
