import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        headline: ['Cinzel Decorative', 'serif'],
        subheadline: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        /* Brand Colors mapped to HSL variables */
        'marrom-terra': 'hsl(var(--marrom-terra))',
        'marrom-escuro': 'hsl(var(--marrom-escuro))',
        'marrom-madeira': 'hsl(var(--marrom-madeira))',
        'caramelo-palha': 'hsl(var(--caramelo-palha))',
        'areia-clara': 'hsl(var(--areia-clara))',
        'areia-media': 'hsl(var(--areia-media))',
        'areia-escura': 'hsl(var(--areia-escura))',
        'verde-folha': 'hsl(var(--verde-folha))',
        'verde-escuro': 'hsl(var(--verde-escuro))',
        'oliva-suave': 'hsl(var(--oliva-suave))',
        'grafite-amadeirado': 'hsl(var(--grafite-amadeirado))',
        'marrom-texto': 'hsl(var(--marrom-texto))',
        'cinza-organico': 'hsl(var(--cinza-organico))',
        'branco-quente': 'hsl(var(--branco-quente))',
        brand: {
          earth: '#4B2E1F',
          espresso: '#2E1B12',
          wood: '#6A432D',
          caramel: '#A87442',
          sand: '#F3E7D3',
          leaf: '#4E5B2C',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'rustic-texture': "url('https://www.transparenttextures.com/patterns/wood-pattern.png')",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;