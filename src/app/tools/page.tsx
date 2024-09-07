import Link from 'next/link'
import { ArrowRight } from '@public/icons'
import { Card, CardBody } from '@components/Material.tsx'
import { Header } from '@components/Header.tsx'
import { Footer } from '@components/Footer.tsx'

const toolsData = [
    {
        title: 'device mockups',
        description: 'add frames to your screenshots',
        href: '/tools/device-mockup',
    },
    {
        title: 'ai chat',
        description: 'talk to an ai',
        href: '/tools/ai-chat',
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
        <div className="mx-auto w-[400px] px-8 md:w-full">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {toolsData.map((tool, index) => (
                    <GridItem key={index} {...tool} />
                ))}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <>
            <Header />
            <main className="size-full bg-[#101010] py-24">
                <div className="mx-auto size-full py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </main>
            <Footer />
        </>
    )
}
