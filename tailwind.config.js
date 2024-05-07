/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            backgroundImage: {
                'site-gradient':
                    'linear-gradient(to top right, #0F172A, #0F172A, #1A2B4C, #0F172A)',
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
