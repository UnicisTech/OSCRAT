import tailwindConfig from '@/tailwind.config';

/**
 * Chart palette tokens resolved from `theme.extend.colors.chart` in
 * `tailwind.config.js`. Acts as the single source of truth for chart
 * colours so JS charting libraries (Chart.js / Recharts / etc.) can
 * consume design tokens without hand-mirroring hex literals in each
 * component.
 *
 * Keys mirror the tailwind config exactly (kebab-case included) so
 * adding a new token in one place flows to every consumer.
 */
export interface ChartPalette {
  coral: string;
  'coral-strong': string;
  teal: string;
  'teal-strong': string;
  blue: string;
  'blue-strong': string;
  green: string;
  'green-strong': string;
  grey: string;
  accent: string;
  muted: string;
  'conformity-compliant': string;
  'conformity-partial': string;
  'conformity-not-compliant': string;
  'conformity-not-applicable': string;
  'conformity-in-evaluation': string;
  'conformity-not-evaluated': string;
}

const config = tailwindConfig as unknown as {
  theme: {
    extend: {
      colors: {
        chart: ChartPalette;
        surface: { DEFAULT: string };
      };
    };
  };
};

export const chartTokens: ChartPalette = config.theme.extend.colors.chart;

/**
 * Card surface colour, sourced from `theme.colors.surface.DEFAULT`.
 * Used by chart components as the slice-separator / border colour so
 * pies appear to "cut" against the card background.
 */
export const surfaceToken: string =
  config.theme.extend.colors.surface.DEFAULT;
