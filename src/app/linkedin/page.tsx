'use client'

import { useRouter } from 'next/navigation'
import { Spinner } from '@components/Material.tsx'
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
        <main>
            <div className="flex min-h-[100vh] flex-col items-center justify-center gap-16 bg-black">
                <Spinner className="size-24" />
                <h1 className="text-center text-4xl">
                    Redirecting to Linkedin
                </h1>
            </div>
        </main>
    )
}
