import { ReactNode } from 'react'
import './globals.css'
import FPSCounter from '@components/providers/FPS-counter.tsx'
import ToastProvider from '@components/providers/toast-provider.tsx'
import { Aurora } from '@components/layout/aurora.tsx'
import { Analytics } from '@vercel/analytics/react'
import { Metadata } from 'next'

export const metadata: Metadata = {
    metadataBase: new URL('https://sarria.ca'),
    icons: {
        icon: '/logo.png',
    },
    description:
        "I'm a mobile and full-stack engineer specializing in app and web development. Explore my portfolio, projects and tools.",
    title: "Hi, I'm Qi!",
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Aurora />
                <ToastProvider>
                    <FPSCounter />
                    {children}
                </ToastProvider>
                <Analytics />
            </body>
        </html>
    )
}
