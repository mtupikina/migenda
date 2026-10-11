import { createTheme, type CSSVariablesResolver } from '@mantine/core';

export const theme = createTheme({
  fontFamily: 'Archivo, system-ui, sans-serif',
  headings: {
    fontFamily: 'Archivo, system-ui, sans-serif',
    fontWeight: '800',
  },
  defaultRadius: 0,
  primaryColor: 'accent',
  primaryShade: 5,
  black: '#201e1d',
  colors: {
    accent: [
      '#fff2ef',
      '#ffe0d9',
      '#ffc4b8',
      '#ff9783',
      '#ff563c',
      '#ec3013',
      '#dd2b0f',
      '#ae1800',
      '#7c1405',
      '#4d170e',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 0,
        fw: 800,
      },
    },
    Anchor: {
      defaultProps: {
        underline: 'never',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 0,
      },
    },
    Checkbox: {
      defaultProps: {
        radius: 0,
        color: 'accent',
      },
    },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-body': '#f3f2f2',
    '--mantine-color-text': '#201e1d',
  },
  dark: {
    '--mantine-color-body': '#f3f2f2',
    '--mantine-color-text': '#201e1d',
  },
});

export const divider = 'color-mix(in srgb, #201e1d 40%, transparent)';
export const hairline = `1px solid ${divider}`;
export const rule = `2px solid ${divider}`;
