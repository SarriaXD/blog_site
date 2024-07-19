import React from 'react'
import './global.css'
import { Header } from '../components/Header.tsx'
import Script from 'next/script'

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
                <Script
                    src="https://kit.fontawesome.com/991aaa700a.js"
                    crossOrigin="anonymous"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>Hi, I'm Qi!</title>
            </head>
            <body>
                <Header />
                {children}
            </body>
        </html>
    )
}
