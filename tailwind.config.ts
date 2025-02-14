import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        "primary": "#141414",
        "primary-hover": "#161616"
      }
    }
  },

  plugins: []
} satisfies Config;
