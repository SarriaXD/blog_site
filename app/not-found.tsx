import Image from 'next/image'
import { Button } from '@components/ui/ui-kit.tsx'
import Link from 'next/link'
import { not_found } from '@public/images'
import { Header } from '@components/layout/header.tsx'
import { Footer } from '@components/layout/footer.tsx'

const NotFoundImage = () => {
    return (
        <div
            className="animate-ghost md:h-full"
            style={{
                maskImage:
                    'radial-gradient(circle, black 0%, transparent 70%, transparent 100%)',
            }}
        >
            <Image
                src={not_found}
                priority={true}
                placeholder="blur"
                alt="404 not fount image"
            />
        </div>
    )
}

const NotFoundText = () => {
    return (
        <div className="flex flex-shrink-0 flex-col items-center justify-center gap-4 self-center lg:gap-8">
            <h1 className="text-gradient-aurora text-center text-4xl md:text-5xl lg:text-6xl">
                Oops!
            </h1>
            <h2 className="text-center text-2xl font-medium text-white/60 md:text-3xl lg:text-4xl">
                <span className="text-[#ff8a9a]">404</span> Page not found
            </h2>
            <Link href="/">
                <Button tone="inverse">Go back to home</Button>
            </Link>
        </div>
    )
}

export default function NotFound() {
    return (
        <>
            <Header />
            <main className="app-main-offset size-full">
                <div className="flex min-h-[70vh] w-full items-center px-8 py-16 lg:px-16">
                    <div className="mx-auto flex flex-col items-center gap-8 md:flex-row lg:gap-32">
                        <NotFoundImage />
                        <NotFoundText />
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
