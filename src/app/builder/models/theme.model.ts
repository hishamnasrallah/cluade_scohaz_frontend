// src/app/builder/models/theme.model.ts

export interface ThemeColor {
  main: string;
  light?: string;
  dark?: string;
  contrastText?: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
}

export interface ThemeSpacing {
  unit: number;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

export interface ThemeBorderRadius {
  small: string;
  medium: string;
  large: string;
  full: string;
}

export interface ThemeShadows {
  none: string;
  small: string;
  medium: string;
  large: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  isPredefined?: boolean;
  colors: {
    primary: ThemeColor;
    accent: ThemeColor;
    warn: ThemeColor;
    background: {
      default: string;
      paper: string;
      dark: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      hint: string;
    };
    divider: string;
    border: string;
    input: {
      background: string;
      border: string;
      focusBorder: string;
      text: string;
      placeholder: string;
    };
  };
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  transitions: {
    duration: {
      short: string;
      standard: string;
      long: string;
    };
    easing: string;
  };
  custom?: { [key: string]: any };
}

export const DEFAULT_THEMES: Theme[] = [
  {
    id: 'material-light',
    name: 'Material Light',
    description: 'Default Material Design light theme',
    isPredefined: true,
    colors: {
      primary: {
        main: '#3f51b5',
        light: '#7986cb',
        dark: '#303f9f',
        contrastText: '#ffffff'
      },
      accent: {
        main: '#ff4081',
        light: '#ff79b0',
        dark: '#c60055',
        contrastText: '#ffffff'
      },
      warn: {
        main: '#f44336',
        light: '#ef5350',
        dark: '#d32f2f',
        contrastText: '#ffffff'
      },
      background: {
        default: '#fafafa',
        paper: '#ffffff',
        dark: '#f5f5f5'
      },
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.54)',
        disabled: 'rgba(0, 0, 0, 0.38)',
        hint: 'rgba(0, 0, 0, 0.38)'
      },
      divider: 'rgba(0, 0, 0, 0.12)',
      border: '#e0e0e0',
      input: {
        background: '#ffffff',
        border: 'rgba(0, 0, 0, 0.42)',
        focusBorder: '#3f51b5',
        text: 'rgba(0, 0, 0, 0.87)',
        placeholder: 'rgba(0, 0, 0, 0.54)'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
      fontSize: {
        small: '12px',
        medium: '14px',
        large: '16px'
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      }
    },
    spacing: {
      unit: 8,
      small: '8px',
      medium: '16px',
      large: '24px',
      xlarge: '32px'
    },
    borderRadius: {
      small: '2px',
      medium: '4px',
      large: '8px',
      full: '50%'
    },
    shadows: {
      none: 'none',
      small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
    },
    transitions: {
      duration: {
        short: '150ms',
        standard: '300ms',
        long: '500ms'
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  {
    id: 'material-dark',
    name: 'Material Dark',
    description: 'Material Design dark theme',
    isPredefined: true,
    colors: {
      primary: {
        main: '#90caf9',
        light: '#e3f2fd',
        dark: '#42a5f5',
        contrastText: '#000000'
      },
      accent: {
        main: '#f48fb1',
        light: '#ffc1e3',
        dark: '#bf5f82',
        contrastText: '#000000'
      },
      warn: {
        main: '#f44336',
        light: '#ef5350',
        dark: '#d32f2f',
        contrastText: '#ffffff'
      },
      background: {
        default: '#303030',
        paper: '#424242',
        dark: '#212121'
      },
      text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
        disabled: 'rgba(255, 255, 255, 0.5)',
        hint: 'rgba(255, 255, 255, 0.5)'
      },
      divider: 'rgba(255, 255, 255, 0.12)',
      border: '#616161',
      input: {
        background: '#424242',
        border: 'rgba(255, 255, 255, 0.7)',
        focusBorder: '#90caf9',
        text: '#ffffff',
        placeholder: 'rgba(255, 255, 255, 0.5)'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica Neue", sans-serif',
      fontSize: {
        small: '12px',
        medium: '14px',
        large: '16px'
      },
      fontWeight: {
        light: 300,
        regular: 400,
        medium: 500,
        bold: 700
      }
    },
    spacing: {
      unit: 8,
      small: '8px',
      medium: '16px',
      large: '24px',
      xlarge: '32px'
    },
    borderRadius: {
      small: '2px',
      medium: '4px',
      large: '8px',
      full: '50%'
    },
    shadows: {
      none: 'none',
      small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
      large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
    },
    transitions: {
      duration: {
        short: '150ms',
        standard: '300ms',
        long: '500ms'
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
];
