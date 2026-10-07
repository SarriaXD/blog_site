'use client'

import Link from 'next/link'
import { ArrowRight } from '@public/icons'
import { Card, CardBody } from '@components/ui/ui-kit.tsx'

const toolsData = [
    {
        title: 'device mockups',
        description: 'add frames to your screenshots',
        href: '/tools/device-mockup',
    },
    {
        title: 'ai chat',
        description: 'talk to an ai',
        href: 'https://chat.sarria.ca',
    },
]

interface GridItemProps {
    title: string
    description: string
    href: string
}

const GridItem = ({ title, description, href }: GridItemProps) => {
    return (
        <Link href={href} className="block h-full">
            <Card tone="neutral" interactive className="h-full">
                <CardBody className="flex items-start gap-4">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold capitalize">
                            {title}
                        </h2>
                        <p className="mt-1 text-[var(--ui-text-secondary)] first-letter:uppercase">
                            {description}
                        </p>
                    </div>
                    <span className="glass-inset flex size-10 shrink-0 items-center justify-center rounded-full text-white/80">
                        <ArrowRight className="size-5" />
                    </span>
                </CardBody>
            </Card>
        </Link>
    )
}

const MainContent = () => {
    return (
        <div className="w-full">
            <h1 className="text-gradient-cool mb-8 text-4xl md:mb-12 md:text-6xl">
                Tools
            </h1>
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolsData.map((tool, index) => (
                    <GridItem key={index} {...tool} />
                ))}
            </div>
        </div>
    )
}

export default MainContent
