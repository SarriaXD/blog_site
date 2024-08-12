import React from 'react'
import './global.css'
import { Header } from './components/Header.tsx'
import { Footer } from './components/Footer.tsx'
import FPSCounter from './components/FPSCounter.tsx'

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
                    content="I'm a mobile and full-stack engineer specializing in app and web development. Explore my portfolio, projects, blog, and contact information on my personal website."
                />
                <title>Hi, I'm Qi!</title>
            </head>
            <body className="min-h-[100vh] w-full">
                <FPSCounter />
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    )
}
