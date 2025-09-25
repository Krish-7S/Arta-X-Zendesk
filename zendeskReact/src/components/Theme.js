import { DEFAULT_THEME } from '@zendeskgarden/react-theming'

const DARK_THEME = {
  ...DEFAULT_THEME,
  colors: {
    ...DEFAULT_THEME.colors,
    background: '#1e1e1e',
    surface: '#2a2a2a',
    text: '#ffffff',
    textLight: '#cccccc',
    border: '#444444',
    primaryHue: 200,
    focus: '#3399ff',
    danger: '#ff6666',
    success: '#4caf50',
  },
  shadows: {
    ...DEFAULT_THEME.shadows,
    modalShadow: '0 4px 20px rgba(0,0,0,0.7)',
  }
}


export { DARK_THEME }
