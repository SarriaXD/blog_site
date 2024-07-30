/** @type {import('tailwindcss').Config} */

import withMT from '@material-tailwind/react/utils/withMT'

export default withMT({
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {
            sans: [
                'SF Pro Display',
                'SF Pro Icons',
                'Helvetica Neue',
                'Helvetica',
                'Arial',
                'sans-serif',
            ],
        },
        extend: {
            keyframes: {
                ghost: {
                    '0%': {
                        transform: 'rotate(0deg) translate(10px) rotate(0deg)',
                    },
                    '50%': { opacity: 0.5 },
                    '100%': {
                        transform:
                            'rotate(360deg) translate(10px) rotate(-360deg)',
                    },
                },
            },
            animation: {
                'animate-ghost': 'ghost 4s linear infinite',
            },
        },
    },
    plugins: [],
})
