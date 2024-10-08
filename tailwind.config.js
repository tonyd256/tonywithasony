const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['_site/**/*.html', '**/*.liquid', '**/*.html', '**/*.md'],
  theme: {
    fontFamily: {
      'sans': ['LatoLatinWeb', 'Helvetica Neue', 'Helvetica', 'system-ui', 'sans-serif'],
      'serif': ['Merriweather', 'system-ui', 'serif'],
      'display': ['LatoLatinWeb']
    },
    extend: {
      screens: {
        '3xl': '2000px',
        '4xl': '2500px'
      },
      keyframes: {
        'tv-close': {
          '0%': {
            transform: 'scale(1,1)',
            background: 'transparent'
          },
          '50%': {
            background: 'transparent'
          },
          '100%': {
            transform: 'scale(6,.05)',
            background: 'black'
          }
        },
        'tv-open': {
          '0%': {
            height: '0'
          },
          '100%': {
            height: '100vh'
          }
        },
        'appear': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        }
      },
      animation: {
        'tv-close': '.3s ease-out 1s 1 normal forwards tv-close',
        'tv-open': '.3s ease-out 1.3s 1 normal forwards tv-open',
        'appear': '1s ease 2s 1 normal forwards appear',
        'appear-quicker': '1s ease 1s 1 normal forwards appear'
      }
    }
  },
  variants: {
    extend: {
      'zIndex': ['hover']
    }
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('mouse', '@media (pointer: fine)');
    })
  ],
}
