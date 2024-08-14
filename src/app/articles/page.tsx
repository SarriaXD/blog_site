import Image from 'next/image'

import Link from 'next/link'
import { Button } from '../../components/Material.tsx'
import { not_found } from '../../../public/images'

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
                alt="under development image"
            />
        </div>
    )
}

const NotFoundText = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4 self-center lg:gap-8">
            <h1
                color="white"
                className="text-center text-4xl md:text-5xl lg:text-6xl"
            >
                Opps!
            </h1>
            <h2
                color={'gray'}
                className="text-center text-2xl md:text-3xl lg:text-4xl"
            >
                This Page is under development
            </h2>
            <Link href="/">
                <Button color="black">Go back to home</Button>
            </Link>
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <div className="flex min-h-[100vh] items-center bg-black px-8 lg:px-16">
                <div className="flex flex-col items-center gap-8 md:flex-row lg:gap-32">
                    <NotFoundImage />
                    <NotFoundText />
                </div>
            </div>
        </main>
    )
}
