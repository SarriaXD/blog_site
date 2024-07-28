import Image from 'next/image'

import Link from 'next/link'
import { not_found } from '../../assets/images'
import { Button, Typography } from '../components/Material.tsx'

const NotFoundImage = () => {
    return (
        <div className="rounded-mask animate-ghost animate-pulse md:h-full">
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
        <div className="flex flex-col items-center justify-center gap-4 self-center xl:gap-8">
            <Typography
                variant={'h1'}
                color="white"
                className="text-center text-4xl md:text-5xl xl:text-6xl"
            >
                Opps!
            </Typography>
            <Typography
                variant={'h2'}
                color={'gray'}
                textGradient={true}
                className="text-center text-2xl md:text-3xl xl:text-4xl"
            >
                This Page is under development
            </Typography>
            <Link href="/">
                <Button color="black">Go back to home</Button>
            </Link>
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <div className="flex min-h-[100vh] items-center bg-black px-8 xl:px-16">
                <div className="flex flex-col items-center gap-8 md:flex-row xl:gap-32">
                    <NotFoundImage />
                    <NotFoundText />
                </div>
            </div>
        </main>
    )
}
