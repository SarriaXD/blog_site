'use client'

import { Button, Container, HEADER_CLASS, IconButton, Tooltip } from '@components/ui/ui-kit.tsx'
import Link from 'next/link'
import { Sidebar } from './sidebar.tsx'
import { useState } from 'react'
import { BurgerMenu, Dog, Email, Github, Linkedin } from '@public/icons'

const internalLinks = [
    { href: '/articles', text: 'Articles', newTab: false },
    { href: '/design-system', text: 'Design', newTab: false },
    {
        href: 'https://github.com/SarriaXD?tab=repositories',
        text: 'Projects',
        newTab: true,
    },
    { href: '/tools', text: 'Tools', newTab: false },
]

const InternalLink = ({
    href,
    text,
    newTab,
}: {
    href: string
    text: string
    newTab: boolean
}) => {
    const linkProps = {
        href,
        ...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    }
    return (
        <li>
            <Link {...linkProps}>
                <Button
                    variant="ghost"
                    tone="neutral"
                    size="lg"
                    className="normal-case"
                >
                    {text}
                </Button>
            </Link>
        </li>
    )
}

export const Header = () => {
    const [open, setOpen] = useState(false)
    const onClose = () => setOpen(false)
    return (
        <>
            <header>
                <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#05070b]/70 backdrop-blur-[20px]">
                    <Container
                        className={`flex items-center justify-between gap-4 ${HEADER_CLASS}`}
                    >
                        <IconButton
                            size="lg"
                            tone="neutral"
                            className="md:hidden"
                            aria-label="Open sidebar"
                            onClick={() => setOpen(true)}
                        >
                            <BurgerMenu className="size-6 text-white" />
                        </IconButton>
                        <Link href="/">
                            <IconButton
                                size="lg"
                                tone="neutral"
                                aria-label="Back To Home"
                                className="bg-transparent"
                            >
                                <Dog className="size-8 text-white" />
                            </IconButton>
                        </Link>
                        <ul className="hidden md:flex md:items-center md:gap-2 lg:gap-6">
                            {internalLinks.map((link) => (
                                <InternalLink key={link.href} {...link} />
                            ))}
                            <li>
                                <Link href="mailto:sarria.qi.wang@gmail.com">
                                    <Tooltip content="Contact me via email">
                                        <IconButton tone="neutral" aria-label="Email Me">
                                            <Email className="size-6 text-white" />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://www.linkedin.com/in/qi-wang-793a562a7"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Tooltip content="Connect with me on LinkedIn">
                                        <IconButton
                                            tone="neutral"
                                            aria-label="View My Linkedin"
                                        >
                                            <Linkedin className="size-6 text-white" />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="https://github.com/SarriaXD"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Tooltip content="Check out my GitHub">
                                        <IconButton tone="neutral" aria-label="View My Github">
                                            <Github className="size-6 text-white" />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                            </li>
                        </ul>
                    </Container>
                </nav>
            </header>
            <Sidebar open={open} onClose={onClose} />
        </>
    )
}
