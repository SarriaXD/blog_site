'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
    const router = useRouter()
    useEffect(() => {
        const redirectAfterOneSecond = async () => {
            router.push('https://www.linkedin.com/in/qi-wang-793a562a7')
        }
        redirectAfterOneSecond().catch()
    })

    return (
        <main className="flex min-h-screen w-full items-center justify-center gap-5 px-6">
            <div className="size-14 animate-spin rounded-full border-4 border-white/15 border-t-white" />
            <h1 className="text-center text-3xl md:text-4xl">
                Redirecting to LinkedIn
            </h1>
        </main>
    )
}
