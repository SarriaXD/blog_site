'use client'

import Link from 'next/link'
import { Container, Glass } from '@components/ui/ui-kit.tsx'
import { Dog } from '@public/icons'

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
        <div className="min-w-[140px]">
            <h2 className="mb-4 text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                {title}
            </h2>
            <ul className="flex flex-col items-start gap-2.5">
                {texts.map((link) => {
                    const newTabProps = link.href?.newTab
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {}
                    return (
                        <li key={link.text}>
                            {link.href ? (
                                <Link href={link.href.href} {...newTabProps}>
                                    <p className="text-[15px] text-[var(--ui-text-secondary)] transition-colors hover:text-white">
                                        {link.text}
                                    </p>
                                </Link>
                            ) : (
                                <p className="text-[15px] text-[var(--ui-text-secondary)]">
                                    {link.text}
                                </p>
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
                text: 'Email: sarria.qi.wang@gmail.com',
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
        <footer className="mt-10 pb-6 text-[var(--ui-text-primary)] md:mt-16 md:pb-8">
            <Container>
                <Glass
                    as="div"
                    tint="clear"
                    band={28}
                    strength={0.7}
                    className="rounded-[32px] [--lg-blur:28px]"
                    contentClassName="flex flex-col gap-10 p-7 md:flex-row md:items-start md:justify-between md:p-12"
                >
                    <div className="flex max-w-[300px] flex-col gap-4">
                        <Dog className="size-10 text-white" />
                        <p className="text-base text-[var(--ui-text-secondary)]">
                            Mobile &amp; full-stack engineer. Building fast
                            apps, glassy interfaces and robust backends from
                            Canada.
                        </p>
                        <p className="text-xs text-white/40">
                            © {new Date().getFullYear()} Qi Wang. All rights
                            reserved.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-10 md:gap-14">
                        {sections.map((section) => (
                            <Section key={section.title} {...section} />
                        ))}
                    </div>
                </Glass>
            </Container>
        </footer>
    )
}
