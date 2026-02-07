import { ReactNode } from 'react'
import './globals.css'
import FPSCounter from '@components/providers/FPS-counter.tsx'
import ToastProvider from '@components/providers/toast-provider.tsx'
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
