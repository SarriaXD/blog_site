/** @type {import('tailwindcss').Config} */

import withMT from '@material-tailwind/react/utils/withMT'

export default withMT({
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {
            sans: [
                'SF Pro Display',
                'SF Pro Icons',
                '-apple-system',
                'BlinkMacSystemFont',
                'Helvetica Neue',
                'Helvetica',
                'Arial',
                'sans-serif',
            ],
        },
        fontSize: {
            base: [
                '17px',
                {
                    lineHeight: '1.4705882353',
                    fontWeight: '600',
                    letterSpacing: '0.022em',
                },
            ],
            lg: [
                '19px',
                {
                    lineHeight: '1.4211026316',
                    letterSpacing: '0.012em',
                    fontWeight: '600',
                },
            ],
            xl: [
                '21px',
                {
                    lineHeight: '1.381002381',
                    letterSpacing: '0.011em',
                    fontWeight: '600',
                },
            ],
            '2xl': [
                '28px',
                {
                    lineHeight: '1.1428571429',
                    letterSpacing: '0.007em',
                    fontWeight: '600',
                },
            ],
            '3xl': [
                '32px',
                {
                    lineHeight: '1.125',
                    letterSpacing: '0.004em',
                    fontWeight: '600',
                },
            ],
            '4xl': [
                '40px',
                {
                    lineHeight: '1.1',
                    letterSpacing: '0em',
                    fontWeight: '600',
                },
            ],
            '5xl': [
                '48px',
                {
                    lineHeight: '1.0834933333',
                    letterSpacing: '-0.003em',
                    fontWeight: '600',
                },
            ],
            '6xl': [
                '56px',
                {
                    lineHeight: '1.0714285714',
                    letterSpacing: '-0.005em',
                    fontWeight: '600',
                },
            ],
            '7xl': [
                '64px',
                {
                    lineHeight: '1.0625',
                    letterSpacing: '-0.009em',
                    fontWeight: '600',
                },
            ],
            '8xl': [
                '80px',
                {
                    lineHeight: '1.05',
                    letterSpacing: '-0.015em',
                    fontWeight: '600',
                },
            ],
        },
        screens: {
            md: '735px',
            lg: '1069px',
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
                ghost: 'ghost 4s linear infinite',
            },
        },
    },
    plugins: [],
})
