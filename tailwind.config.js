/** @type {import('tailwindcss').Config} */

import withMT from '@material-tailwind/react/utils/withMT'

export default withMT({
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            backgroundImage: {
                'hero-section-gradient':
                    'linear-gradient(180deg,#000000 0%,rgba(0,0,0,0) 100%), radial-gradient(211.50000000000003% 113.1% at -66.4% 35.9%, #0b014a 39.13195153221485%, rgb(0, 73, 184) 51.424349881796694%, rgb(50, 100, 227) 67.59505338573997%, rgb(0, 204, 255) 77.36876020980384%, rgb(110, 255, 211) 90%, rgb(236, 241, 56) 100%)',
                'hero-text-gradient':
                    'linear-gradient(90deg, #e8867c, #f5af19, #f12711)',
            },
        },
    },
    plugins: [],
})
