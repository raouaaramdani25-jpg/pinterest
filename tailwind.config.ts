import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cozy: {
          50: '#faf7f2',
          100: '#f4ede2',
          200: '#e8dbca',
          300: '#d7c1a8',
          400: '#c3a384',
          500: '#b28867',
          600: '#9b7053',
          700: '#7c5742',
          800: '#674738',
          900: '#553c30',
          950: '#2f1f1a',
        },
        pinterest: {
          DEFAULT: '#E60023',
          hover: '#ad081b',
        },
        amazon: {
          DEFAULT: '#FF9900',
          hover: '#e68a00',
          dark: '#146eb4',
        }
      },
    },
  },
  plugins: [],
};
export default config;
