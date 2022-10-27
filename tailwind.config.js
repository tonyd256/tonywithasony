const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['_site/**/*.html', '**/*.liquid', '**/*.html', '**/*.md'],
  theme: {
    fontFamily: {
      'sans': ['Lato', 'Helvetica Neue', 'Helvetica', 'sans-serif'],
      'serif': ['Merriweather', 'serif'],
      'display': ['Permanent Marker']
    },
    extend: {
      colors: {
        'pink': '#F578A4',
        'blue': '#02EBFA',
        'purple': '#A96EE6',
        'green': '#30DB78',
        'yellow': '#F5D841',
        'orange': '#F4885B',
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
            transform: 'scale(4,.05)',
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
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-fill-transparent': {
          '-webkit-text-fill-color': 'transparent'
        }
      });
    }),
  ],
}
