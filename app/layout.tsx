import { ReactNode } from 'react'
import '@ui/global.css'
import FPSCounter from '@ui/FPS-counter.tsx'
import ToastProvider from '@ui/toast-provider.tsx'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    metadataBase: new URL('https://sarria.com'),
    icons: {
        icon: '/logo.png',
    },
    description:
        "I'm a mobile and full-stack engineer specializing in app and web development. Explore my portfolio, p",
    title: "Hi, I'm Qi!",
}

export default function RootLayout({
    children,
}: {
    children: ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ToastProvider>
                    <FPSCounter />
                    {children}
                </ToastProvider>
                <Analytics />
            </body>
        </html>
    )
}
