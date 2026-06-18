import type { RiskLevel } from '@/types/risk';

const EXPOSURE_MATRIX: Record<RiskLevel, Record<RiskLevel, RiskLevel>> = {
  HIGH: { HIGH: 'HIGH', MEDIUM: 'HIGH', LOW: 'MEDIUM' },
  MEDIUM: { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' },
  LOW: { HIGH: 'MEDIUM', MEDIUM: 'LOW', LOW: 'LOW' },
};

export const calculateExposure = (
  likelihood: RiskLevel,
  impact: RiskLevel
): RiskLevel => EXPOSURE_MATRIX[likelihood][impact];

export const RISK_LEVEL_BADGE_CLASSES: Record<RiskLevel, string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW: 'bg-green-100 text-green-700 border-green-200',
};
