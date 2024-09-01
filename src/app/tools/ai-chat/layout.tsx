import React from 'react'
import '@styles/global.css'
// import { Header } from '@components/Header.tsx'
// import FPSCounter from '@components/FPSCounter.tsx'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`relative bg-black text-white antialiased`}>
            <head>
                <meta charSet="UTF-8" />
                <link rel="icon" type="image/svg+xml" href="/logo.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <meta
                    name="description"
                    content="A chatbot that uses AI to communicate with users."
                />
                <title>AI Chat</title>
            </head>
            <body className="min-h-[100vh] w-full">
                {/*<FPSCounter />*/}
                {/*<Header />*/}
                {children}
            </body>
        </html>
    )
}
