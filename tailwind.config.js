/** @type {import('tailwindcss').Config} */

import withMT from '@material-tailwind/react/utils/withMT'

export default withMT({
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'hero-section-gradient':
                    'linear-gradient(180deg,#000000 0%,rgba(0,0,0,0) 100%), radial-gradient(200% 100% at -66% 36%, #0b014a 40%, rgb(0, 73, 184) 80%, rgb(50, 100, 227) 90%, rgb(0, 204, 255) 100%)',
                'hero-text-gradient':
                    'linear-gradient(90deg, #e8867c, #f5af19, #f12711)',
            },
            maskImage: {
                'mask-gradient':
                    'linear-gradient(to right, transparent, black 50px), linear-gradient(to left, transparent, black 50px), linear-gradient(to bottom, transparent, black 50px), linear-gradient(to top, transparent, black 50px)',
            },
        },
    },
    plugins: [],
})
