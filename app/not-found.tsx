import Image from 'next/image'
import { not_found } from '../assets/images'
import { Button, Typography } from './components/Material.tsx'
import Link from 'next/link'

const NotFoundImage = () => {
    return (
        <div className="rounded-mask animate-ghost max-w-[90%] animate-pulse md:h-full">
            <Image src={not_found} alt="404 not fount image" />
        </div>
    )
}

const NotFoundText = () => {
    return (
        <div className="flex flex-shrink-0 flex-col items-center justify-center gap-4 self-center xl:gap-8">
            <Typography
                variant={'h1'}
                color="white"
                className="text-center text-8xl"
            >
                Opps!
            </Typography>
            <Typography variant={'h2'} color={'white'} className="text-center">
                <span className="text-red-400">404</span> Page not found
            </Typography>
            <Link href="/">
                <Button color="black">Go back to home</Button>
            </Link>
        </div>
    )
}

export default function NotFound() {
    return (
        <main>
            <div className="flex min-h-[100vh] items-center bg-black px-8 py-24 xl:px-16">
                <div className="flex flex-col items-center gap-8 md:flex-row xl:gap-32">
                    <NotFoundImage />
                    <NotFoundText />
                </div>
            </div>
        </main>
    )
}
