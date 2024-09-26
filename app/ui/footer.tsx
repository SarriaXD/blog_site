'use client'

import Link from 'next/link'

interface SectionProps {
    title: string
    texts: {
        text: string
        href?: {
            href: string
            newTab: boolean
        }
    }[]
}

const Section = ({ title, texts }: SectionProps) => {
    return (
        <div>
            <h1 className="mb-4 text-lg font-semibold">{title}</h1>
            <ul className="flex flex-col items-start gap-2">
                {texts.map((link) => {
                    const newTabProps = link.href?.newTab
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {}
                    return (
                        <li key={link.text}>
                            {link.href ? (
                                <Link href={link.href.href} {...newTabProps}>
                                    <p className="text-gray-400 hover:text-gray-200">
                                        {link.text}
                                    </p>
                                </Link>
                            ) : (
                                <p className="text-gray-400">{link.text}</p>
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
        texts: [
            { text: 'Qi Wang' },
            { text: '225 Carlton Street' },
            { text: 'Winnipeg, MB R3C 0V3' },
        ],
    },
    {
        title: 'Follow Me',
        texts: [
            {
                text: 'Github',
                href: {
                    href: 'https://github.com/SarriaXD',
                    newTab: true,
                },
            },
            {
                text: 'Twitter',
                href: {
                    href: 'https://x.com/qi_wang_sarria',
                    newTab: true,
                },
            },
            {
                text: 'LinkedIn',
                href: {
                    href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
                    newTab: true,
                },
            },
        ],
    },
    {
        title: 'Contact Me',
        texts: [
            {
                text: 'Email:sarria.qi.wang@gmail.com',
                href: {
                    href: 'mailto:sarria.qi.wang@gmail.com',
                    newTab: false,
                },
            },
            {
                text: 'Phone: (431) 788-6683',
                href: {
                    href: 'tel:4317886683',
                    newTab: false,
                },
            },
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
