import React from 'react'
import { Header } from '../ui/header.tsx'
import { Footer } from '../ui/footer.tsx'
import NotFoundText from '../ui/articles/not-found-text.tsx'
import NotFoundImage from '../ui/articles/not-found-image.tsx'

export default function Page() {
    return (
        <>
            <Header />
            <main className="size-full">
                <div className="flex size-full items-center bg-black px-8 lg:px-16">
                    <div className="flex flex-col items-center gap-8 md:flex-row lg:gap-32">
                        <NotFoundImage />
                        <NotFoundText />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
