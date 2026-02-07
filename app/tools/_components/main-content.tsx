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
        <Link href={href}>
            <Card color="gray">
                <CardBody className="flex">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold capitalize">
                            {title}
                        </h2>
                        <p>{description}</p>
                    </div>
                    <ArrowRight className="size-6 text-gray-500" />
                </CardBody>
            </Card>
        </Link>
    )
}

const MainContent = () => {
    return (
        <div className="w-full">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolsData.map((tool, index) => (
                    <GridItem key={index} {...tool} />
                ))}
            </div>
        </div>
    )
}

export default MainContent
