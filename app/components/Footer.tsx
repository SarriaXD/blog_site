import Link from 'next/link'
import { Typography } from './Material.tsx'

interface SectionProps {
    title: string
    links: { text: string; href?: string }[]
}

const Section = ({ title, links }: SectionProps) => {
    return (
        <div>
            <Typography variant={'h4'} className="mb-4 text-lg font-semibold">
                {title}
            </Typography>
            <ul className="flex flex-col items-start gap-2">
                {links.map((link) => {
                    return (
                        <li key={link.text}>
                            {link.href ? (
                                <Link href={link.href}>
                                    <Typography
                                        variant={'paragraph'}
                                        className="text-gray-400 hover:text-gray-200"
                                    >
                                        {link.text}
                                    </Typography>
                                </Link>
                            ) : (
                                <Typography
                                    variant={'paragraph'}
                                    className="text-gray-400"
                                >
                                    {link.text}
                                </Typography>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

const sections = [
    {
        title: 'About Me',
        links: [
            { text: 'Qi Wang' },
            { text: '225 Carlton Street' },
            { text: 'Winnipeg, MB R3C 0V3' },
        ],
    },
    {
        title: 'Follow Me',
        links: [
            { text: 'Github', href: 'https://github.com/SarriaXD' },
            { text: 'Twitter', href: 'https://x.com/qi_wang_sarria' },
            {
                text: 'LinkedIn',
                href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
            },
        ],
    },
    {
        title: 'Contact Me',
        links: [
            {
                text: 'Email:sarria.qi.wang@gmail.com',
                href: 'mailto:sarria.qi.wang@gmail.com',
            },
            { text: 'Phone: (431) 788-6683', href: 'tel:4317886683' },
        ],
    },
]

export const Footer = () => {
    return (
        <footer className="border-t border-gray-700 bg-black text-gray-200">
            <div className="container mx-auto flex flex-wrap justify-start gap-16 px-8 py-16 md:justify-end">
                {sections.map((section) => (
                    <Section key={section.title} {...section} />
                ))}
            </div>
        </footer>
    )
}
