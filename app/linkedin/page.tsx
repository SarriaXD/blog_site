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
        <main className="flex size-full items-center justify-center gap-4">
            <div className="size-16 animate-spin rounded-full border-4 border-gray-700 border-t-white" />
            <h1 className="text-center text-4xl">Redirecting to Linkedin</h1>
        </main>
    )
}
