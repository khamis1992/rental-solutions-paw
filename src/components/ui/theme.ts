export const theme = {
  colors: {
    primary: {
      DEFAULT: '#F97316',
      hover: '#F97316CC',
      light: '#FB923C',
      dark: '#EA580C',
    },
    secondary: {
      DEFAULT: '#221F26',
      hover: '#221F26CC',
      light: '#2C2933',
      dark: '#18161C',
    },
    highlight: '#FEF7CD',
    success: '#F2FCE2',
    info: '#D3E4FD',
    background: {
      DEFAULT: '#FFFFFF',
      alt: '#F3F4F6',
    },
    text: {
      DEFAULT: '#222222',
      muted: '#666666',
    },
    muted: '#F3F4F6',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      h1: '2rem',
      h2: '1.5rem',
      h3: '1.25rem',
      body: '1rem',
    },
    lineHeight: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      body: '1.5rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    header: '56px',
    sidebar: '280px',
    section: '2rem',
    gridGap: '1.5rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  shadows: {
    card: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    cardHover: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    buttonHover: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    duration: '300ms',
    timing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1400px',
  },
} as const;

export type Theme = typeof theme;