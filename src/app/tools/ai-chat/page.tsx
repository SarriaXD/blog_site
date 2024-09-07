'use client'

import ChatContent from './components/ChatContent.tsx'
import { Header } from '@components/Header.tsx'
import React from 'react'

export default function Page() {
    return (
        <>
            <style jsx global>{`
                html {
                    background-color: #212121;
                }
            `}</style>
            <Header />
            <main className="size-full">
                <ChatContent />
            </main>
        </>
    )
}
