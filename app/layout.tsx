import React from 'react'
import './global.css'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <link rel="icon" type="image/svg+xml" href="/logo.png" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>Hi, I'm Qi!</title>
            </head>
            <body>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    )
}
