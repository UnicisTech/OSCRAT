import {
  IncidentStatus,
  IncidentClassification,
  IncidentAttackType,
  IncidentSeverity,
} from '@oscrat/model';

export const INCIDENT_STATUS_MAP: Record<IncidentStatus, string> = {
  [IncidentStatus.PENDING]: 'oscrat.ui.versions.incidents.status-pending',
  [IncidentStatus.START]: 'oscrat.ui.versions.incidents.status-start',
  [IncidentStatus.DECLARED]: 'oscrat.ui.versions.incidents.status-declared',
  [IncidentStatus.STABLE]: 'oscrat.ui.versions.incidents.status-stable',
  [IncidentStatus.ACTIVE]: 'oscrat.ui.versions.incidents.status-active',
  [IncidentStatus.RESOLVED]: 'oscrat.ui.versions.incidents.status-resolved',
  [IncidentStatus.COMPLETED]: 'oscrat.ui.versions.incidents.status-completed',
};

export const INCIDENT_CLASSIFICATION_MAP: Record<
  IncidentClassification,
  string
> = {
  [IncidentClassification.GENERAL]:
    'oscrat.ui.versions.incidents.classification-general',
  [IncidentClassification.CONFIDENTIALITY]:
    'oscrat.ui.versions.incidents.classification-confidentiality',
  [IncidentClassification.INTEGRITY]:
    'oscrat.ui.versions.incidents.classification-integrity',
  [IncidentClassification.AVAILABILITY]:
    'oscrat.ui.versions.incidents.classification-availability',
  [IncidentClassification.ACCESS_CONTROL]:
    'oscrat.ui.versions.incidents.classification-access-control',
  [IncidentClassification.VULNERABILITIES]:
    'oscrat.ui.versions.incidents.classification-vulnerabilities',
  [IncidentClassification.TECHNICAL_FAILURE]:
    'oscrat.ui.versions.incidents.classification-technical-failure',
  [IncidentClassification.THEFT_OR_LOSS]:
    'oscrat.ui.versions.incidents.classification-theft-or-loss',
};

export const INCIDENT_ATTACK_TYPE_MAP: Record<IncidentAttackType, string> = {
  [IncidentAttackType.DENIAL_OF_SERVICE]:
    'oscrat.ui.versions.incidents.attack-type-denial-of-service',
  [IncidentAttackType.UNAUTHORISED_ACCESS]:
    'oscrat.ui.versions.incidents.attack-type-unauthorised-access',
  [IncidentAttackType.MALWARE]:
    'oscrat.ui.versions.incidents.attack-type-malware',
  [IncidentAttackType.ABUSE]: 'oscrat.ui.versions.incidents.attack-type-abuse',
  [IncidentAttackType.OTHERS]:
    'oscrat.ui.versions.incidents.attack-type-others',
};

export const INCIDENT_SEVERITY_MAP: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]: 'oscrat.ui.versions.incidents.severity-low',
  [IncidentSeverity.MEDIUM]: 'oscrat.ui.versions.incidents.severity-medium',
  [IncidentSeverity.HIGH]: 'oscrat.ui.versions.incidents.severity-high',
  [IncidentSeverity.CRITICAL]: 'oscrat.ui.versions.incidents.severity-critical',
};
