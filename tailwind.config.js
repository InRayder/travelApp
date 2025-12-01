/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    safelist: [
        {
            pattern: /from-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
        },
        {
            pattern: /to-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
        },
    ],
    theme: {
        extend: {
            colors: {
                'jp-cream': '#FDFCF6',
                'jp-yellow': '#F3E7CA',
                'jp-mustard': '#E6B422',
                'jp-gray': '#727171',
                'jp-dark': '#484848',
                'jp-accent-blue': '#5B84B1',
                'jp-accent-green': '#8FA177',
                'jp-red': '#D64045',
                'jp-indigo': '#6667AB',
            },
            fontFamily: {
                sans: ['"Noto Sans TC"', '"Noto Sans JP"', 'sans-serif'],
            },
            boxShadow: {
                'card': '0 4px 15px rgba(0, 0, 0, 0.03)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [],
}
