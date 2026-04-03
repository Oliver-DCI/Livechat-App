import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        // Eine 8-sekündige, weiche Bewegung für den Hintergrund
        'gradient-vibrant': 'vibrant 8s ease infinite',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        vibrant: {
          '0%, 100%': { 
            'background-size': '200% 200%', 
            'background-position': 'left center',
          },
          '50%': { 
            'background-size': '200% 200%', 
            'background-position': 'right center',
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;