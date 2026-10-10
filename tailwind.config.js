/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: '#0F172A',
          deep: '#0B192C',
          slate: '#1E293B',
          card: '#1E293B',
          border: '#334155',
          primary: '#0284C7',
          teal: '#0D9488',
          tealLight: '#14B8A6',
          amber: '#D97706',
          amberLight: '#F59E0B',
          red: '#DC2626',
          redLight: '#EF4444',
          green: '#059669',
          greenLight: '#10B981',
          accent: '#38BDF8',
          lightBg: '#F8FAFC',
          cardLight: '#FFFFFF',
          textDark: '#0F172A',
          textMuted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
