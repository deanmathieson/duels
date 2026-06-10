/** @type {import('tailwindcss').Config} */
// Worker F (design system). Hearthstone-inspired theme: warm wood table, golden
// frames, gem-cut mana orbs, parchment, rarity gems. These tokens are the shared
// design vocabulary — other UI workers should reuse the colors / shadows / fonts
// and the @layer component classes defined in assets/css/main.css.
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
    './composables/**/*.{js,ts}',
    './stores/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        // --- table / wood ---
        wood: {
          900: '#1a120a',
          800: '#2a1c10',
          700: '#3a2a18',
          600: '#4d3620',
          500: '#63482b',
          400: '#7c5c39',
          300: '#9a744a',
          200: '#b9925f'
        },
        // --- gold (frames, buttons, accents) ---
        gold: {
          DEFAULT: '#f0c850',
          light: '#ffe9a8',
          200: '#ffe9a8',
          400: '#f0c850',
          500: '#d8a830',
          600: '#b8841f',
          700: '#8a5e16',
          dark: '#8a5e16'
        },
        // --- parchment (panels, card text) ---
        parchment: {
          DEFAULT: '#e8d9b5',
          light: '#f3e9d2',
          dark: '#cdb888',
          shadow: '#a98f5d'
        },
        // --- mana ---
        mana: {
          DEFAULT: '#2e7fd6',
          light: '#6fb6ff',
          dark: '#11447f',
          gem: '#1f6fcf'
        },
        // --- stat gems ---
        attack: {
          DEFAULT: '#f0c850',
          dark: '#9a6a12'
        },
        health: {
          DEFAULT: '#d8412f',
          dark: '#7a1810'
        },
        // --- rarity ---
        rarity: {
          free: '#9aa0a6',
          common: '#c7ccd1',
          rare: '#3d7ff0',
          epic: '#b14ee0',
          legendary: '#f0902a'
        }
      },
      fontFamily: {
        // Display: Cinzel (engraved fantasy serif) for names / headings.
        display: ['Cinzel', 'Trajan Pro', 'Georgia', 'serif'],
        // Body: Marcellus / Cabin for card text and UI copy.
        body: ['Marcellus', 'Cabin', 'Georgia', 'serif'],
        sans: ['Cabin', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        // Card resting + hover lift.
        card: '0 6px 14px rgba(0,0,0,0.55), 0 1px 2px rgba(0,0,0,0.5)',
        'card-lift': '0 18px 34px rgba(0,0,0,0.6), 0 6px 12px rgba(0,0,0,0.45)',
        // Golden glow for playable / selected cards.
        glow: '0 0 14px 3px rgba(240,200,80,0.55), 0 0 4px 1px rgba(255,233,168,0.7)',
        'glow-lg': '0 0 28px 8px rgba(240,200,80,0.6), 0 0 10px 2px rgba(255,233,168,0.8)',
        // Inset rim used by gems / orbs.
        gem: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.5)',
        // Wood panel relief.
        panel: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 6px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.55)',
        frame: 'inset 0 0 0 1px rgba(0,0,0,0.5), inset 0 0 6px rgba(0,0,0,0.6)',
        // Pressed/inset relief (buttons, toggles in their active state).
        'inset-deep': 'inset 0 2px 6px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)',
        // Edge vignette ring for framed viewports / modals.
        vignette: '0 0 60px 30px rgba(0,0,0,0.6) inset'
      },
      borderRadius: {
        card: '14px',
        gem: '50%'
      },
      keyframes: {
        cardGlow: {
          '0%, 100%': { boxShadow: '0 0 12px 2px rgba(240,200,80,0.45), 0 0 4px 1px rgba(255,233,168,0.6)' },
          '50%': { boxShadow: '0 0 22px 6px rgba(240,200,80,0.7), 0 0 10px 2px rgba(255,233,168,0.9)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' }
        },
        popIn: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)' }
        },
        auraPulse: {
          '0%, 100%': { boxShadow: '0 0 8px 1px rgba(240,200,80,0.45)' },
          '50%': { boxShadow: '0 0 18px 5px rgba(240,200,80,0.75)' }
        }
      },
      animation: {
        cardGlow: 'cardGlow 1.8s ease-in-out infinite',
        float: 'float 3.5s ease-in-out infinite',
        pulseSoft: 'pulse 2s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        drift: 'drift 4.5s ease-in-out infinite',
        popIn: 'popIn 0.32s cubic-bezier(0.22,1.2,0.36,1) both',
        auraPulse: 'auraPulse 1.8s ease-in-out infinite'
      },
      dropShadow: {
        engrave: '0 1px 1px rgba(0,0,0,0.85)',
        gold: '0 0 6px rgba(240,200,80,0.7)'
      }
    }
  },
  plugins: []
}
