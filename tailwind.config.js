const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['_site/**/*.html', '**/*.liquid', '**/*.html', '**/*.md'],
  theme: {
    fontFamily: {
      'sans': ['Helvetica Neue', 'Helvetica', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"]
    },
    extend: {
      colors: {
        'pink': '#F578A4',
        'blue': '#02EBFA',
        'purple': '#A96EE6',
        'green': '#30DB78',
        'yellow': '#F5D841',
        'orange': '#F4885B',
      }
    }
  },
  variants: {
    extend: {
     'textFilltransparent': ['hover']
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
