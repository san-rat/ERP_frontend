/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink:     '#213555',
        primary: '#4F709C',
        surface: '#D8C4B6',
        bg:      '#F5EFE7',
        success: { DEFAULT: '#3D8B37', light: '#D1FAE5', text: '#065F46' },
        warning: { DEFAULT: '#D97706', light: '#FEF3C7', text: '#92400E' },
        danger:  { DEFAULT: '#DC2626', light: '#FEE2E2', text: '#991B1B' },
        info:    { DEFAULT: '#4F709C', light: '#EFF6FF', text: '#1E40AF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:     '0 1px 3px rgba(33,53,85,0.08), 0 1px 2px rgba(33,53,85,0.04)',
        dropdown: '0 4px 12px rgba(33,53,85,0.12)',
      },
    },
  },
  plugins: [],
}