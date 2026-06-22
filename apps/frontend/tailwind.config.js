module.exports = {
  mode: 'jit',
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    'node_modules/daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — Figma color/blue/700. `DEFAULT` makes bare `*-primary`
        // resolve here (unifying with daisyUI's primary); `default` keeps
        // legacy `*-primary-default` utilities working. light/dark are
        // derived from Material blue — confirm against the Figma blue scale.
        primary: {
          DEFAULT: '#1976D2',
          default: '#1976D2',
          light: '#42A5F5',
          dark: '#1565C0',
        },
        // Neutral scale (only the steps the designs actually use so far —
        // pull the full ramp from the Figma "Library" page when needed).
        grey: {
          200: '#EEEEEE', // page bg, dividers
          300: '#E0E0E0', // table-header bottom border
          400: '#BDBDBD', // default borders
          500: '#9E9E9E', // disabled borders, icons
          600: '#757575', // muted text (menu descriptions)
          700: '#616161', // secondary text (captions, descriptions)
          900: '#212121', // primary text
        },
        // Semantic feedback roles. Each: DEFAULT (solid/text) · subtle (light
        // bg) · emphasis (strong text on subtle) · border. Values are sensible
        // defaults that match the existing hardcoded usage — confirm exact
        // hexes against the Figma Library status palette.
        danger: {
          DEFAULT: '#E53935', // Figma red (chips, status dots, error border) — Material red 600
          hover: '#D32F2F', // Material red 700 — error field hover border
          subtle: '#FFEBEE', // red-50 — error banner bg
          emphasis: '#C62828', // red-800 — error banner text
          border: '#EF9A9A', // red-200 — error field border
        },
        success: {
          DEFAULT: '#16A34A', // green-600
          subtle: '#DCFCE7', // green-100
          emphasis: '#166534', // green-800
          border: '#86EFAC', // green-300
        },
        warning: {
          DEFAULT: '#FB8C00', // Figma orange/600 (alert border + icon)
          subtle: '#FFF3E0', // orange/50 — alert bg
          emphasis: '#E65100', // orange/900 — strong text
          border: '#FFB74D', // orange/300 — field borders
        },
        // Yellow — "Medium" severity, distinct from warning (orange "High").
        caution: {
          DEFAULT: '#EAB308', // yellow/500
          subtle: '#FEF9C3', // yellow/100 — pill & card bg
          emphasis: '#854D0E', // yellow/800 — strong text
          border: '#FDE047', // yellow/300
        },
        // Distinct from `primary` (shares the brand hue but is its own token,
        // so info can diverge later). Aligned to the Material/Figma blue.
        info: {
          DEFAULT: '#1976D2', // brand blue
          subtle: '#E3F2FD', // light blue banner bg
          emphasis: '#0D47A1', // strong blue text
          border: '#90CAF9',
        },
        // Surfaces / backgrounds — Figma neutrals, matching daisyUI base-100/
        // 200/300. Today many places hardcode bg-white / bg-gray-50 /
        // border-gray-200; migrating them here makes cards & pages consistent.
        surface: {
          DEFAULT: '#FFFFFF', // cards, panels, raised (neutral/white)
          sunken: '#EEEEEE', // app/page background (grey/200)
          muted: '#F5F5F5', // subtle fills, hover rows (grey/100)
          inverse: '#212121', // dark surfaces (grey/900)
          disabled: 'rgba(0,0,0,0.08)', // disabled field fill (neutral/black 8%)
        },
        // Borders / dividers on surfaces & fields. `border-line` = default.
        line: {
          DEFAULT: '#BDBDBD', // grey/400 — card & field borders (Figma)
          subtle: '#EEEEEE', // grey/200 — light dividers (table cells)
          header: '#E0E0E0', // grey/300 — table-header bottom border
          strong: '#9E9E9E', // grey/500 — emphasis
        },
        // Text colours (semantic). `text-content` = primary body text.
        content: {
          DEFAULT: '#212121', // grey/900 — primary text & headings
          secondary: '#616161', // grey/700 — captions, descriptions
          muted: '#757575', // grey/600 — menu descriptions, hints
          placeholder: '#9E9E9E', // grey/500 — placeholders, disabled text & icons
          inverse: '#FFFFFF', // text on dark/brand surfaces
        },
        // Button component palette — Figma "M_Button". `primary` is a solid
        // indigo fill that is intentionally distinct from the brand `primary`
        // blue; its hover/active follow the Material blue scale. Secondary &
        // tertiary buttons have no fill at rest and use neutral black-alpha
        // "state layers" on hover/active. Text, border, disabled-text and the
        // focus ring reuse the semantic content/line/primary tokens, so only
        // the button-specific values live here.
        button: {
          primary: '#3952AD', // primary default fill (Figma indigo)
          'primary-hover': '#1565C0', // blue/800 (= primary-dark)
          'primary-active': '#0D47A1', // blue/900
          'primary-disabled': '#BDBDBD', // grey/400 — disabled fill (white text)
          overlay: 'rgba(0,0,0,0.04)', // hover state layer (secondary/tertiary)
          'overlay-active': 'rgba(0,0,0,0.08)', // active/pressed state layer
        },
        // Chart palette — the single source of truth for every colour
        // a JS charting library (Chart.js / Recharts / etc.) consumes.
        // Components MUST read these via the `chartTokens` helper rather
        // than re-declaring hex literals.
        //
        // Three groups live under one namespace:
        //  1. Categorical hue pairs (light = secondary/manual series,
        //     `-strong` = primary/auto series of the same hue).
        //  2. `accent`/`muted` binary pair for "processed vs untouched"
        //     charts; kept disjoint from the categorical hues so a
        //     binary chart and a categorical chart never share colours
        //     when shown together.
        //  3. `conformity-*` palette for the compliance conformity pie
        //     (semantic per status, but tuned for the pie context so
        //     values differ slightly from the global semantic tokens).
        chart: {
          coral: '#FA938E',
          'coral-strong': '#E63946',
          teal: '#51CCD0',
          'teal-strong': '#0D9488',
          blue: '#5BA5FF',
          'blue-strong': '#1E40AF',
          green: '#86EFAC',
          'green-strong': '#15803D',
          grey: '#DADADA',
          accent: '#3952AD',
          muted: '#E0E0E0',
          'conformity-compliant': '#16A34A', // green-600
          'conformity-partial': '#D97706', // amber-600
          'conformity-not-compliant': '#E53935', // red-600
          'conformity-not-applicable': '#9E9E9E', // grey-500
          'conformity-in-evaluation': '#1976D2', // primary blue
          'conformity-not-evaluated': '#E0E0E0', // grey-300
        },
      },
      fontSize: {
        // Figma "A_Text" type ramp — [size, line-height]. The size/line-height
        // axis only; weight is a separate utility (font-normal 400 / font-medium
        // 500 / font-bold 700, all in the loaded Roboto set). Buttons & Links
        // reuse these sizes: Button = size + font-medium; Link = + underline.
        h1: ['40px', '48px'],
        h2: ['34px', '40px'],
        h3: ['28px', '40px'],
        h4: ['24px', '32px'],
        h5: ['20px', '24px'],
        h6: ['18px', '24px'],
        b1: ['16px', '24px'], // body / Button1 / Link1
        b2: ['14px', '24px'], // body / Button2 / Link2
        c1: ['12px', '16px'], // caption / Button3 / Link3
        c2: ['10px', '16px'], // caption
      },
      borderRadius: {
        input: '4px', // fields, dropdowns
        card: '8px', // cards, form containers
      },
      // Figma "Effect styles" — Material elevation levels. Keys match the
      // Figma style names (1–24). Use for overlays (menus, dropdowns, modals,
      // popovers); flat cards intentionally have no shadow. e.g. `shadow-8`.
      boxShadow: {
        1: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px rgba(0,0,0,0.14), 0px 1px 3px rgba(0,0,0,0.12)',
        2: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px rgba(0,0,0,0.14), 0px 1px 5px rgba(0,0,0,0.12)',
        3: '0px 3px 3px -2px rgba(0,0,0,0.2), 0px 3px 4px rgba(0,0,0,0.14), 0px 1px 8px rgba(0,0,0,0.12)',
        4: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px rgba(0,0,0,0.14), 0px 1px 10px rgba(0,0,0,0.12)',
        6: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px rgba(0,0,0,0.14), 0px 1px 18px rgba(0,0,0,0.12)',
        8: '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)',
        12: '0px 7px 8px -4px rgba(0,0,0,0.2), 0px 12px 17px 2px rgba(0,0,0,0.14), 0px 5px 22px 4px rgba(0,0,0,0.12)',
        16: '0px 8px 10px -5px rgba(0,0,0,0.2), 0px 16px 24px 5px rgba(0,0,0,0.14), 0px 6px 30px 5px rgba(0,0,0,0.12)',
        24: '0px 11px 15px -7px rgba(0,0,0,0.2), 0px 24px 38px 3px rgba(0,0,0,0.14), 0px 9px 46px 8px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: [
          'Roboto',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  // daisyUI semantic theme — recolours the ~54 daisyUI components (cards,
  // buttons, badges, etc.) with the OSCRAT tokens. The first theme is applied
  // at :root, so this takes effect app-wide without needing a data-theme attr.
  daisyui: {
    themes: [
      {
        light: {
          primary: '#1976D2', // Figma color/blue/700
          'primary-content': '#FFFFFF',
          secondary: '#9E9E9E', // grey/500
          'secondary-content': '#FFFFFF',
          accent: '#1976D2',
          neutral: '#212121', // grey/900
          'neutral-content': '#FFFFFF',
          'base-100': '#FFFFFF', // card / surface (neutral/white)
          'base-200': '#EEEEEE', // page bg (grey/200)
          'base-300': '#BDBDBD', // borders (grey/400)
          'base-content': '#212121', // text (grey/900)
          // Semantic feedback — kept in sync with theme.extend.colors above.
          info: '#1976D2',
          'info-content': '#FFFFFF',
          success: '#16A34A',
          'success-content': '#FFFFFF',
          warning: '#FB8C00',
          'warning-content': '#FFFFFF',
          error: '#E53935',
          'error-content': '#FFFFFF',
          '--rounded-box': '0.5rem', // 8px — cards
          '--rounded-btn': '0.5rem', // 8px — buttons
          '--rounded-badge': '0.5rem', // 8px — chips/badges
        },
      },
    ],
  },
};
