import Link from 'next/link'
import { Button } from '@components/ui/ui-kit.tsx'

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
                <Button tone="inverse">Go back to home</Button>
            </Link>
        </div>
    )
}

export default NotFoundText
