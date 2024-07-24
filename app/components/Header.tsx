'use client'

import { Button, IconButton, Tooltip } from './Material.tsx'
import Link from 'next/link'
import { SideBar } from './SideBar.tsx'
import { useState } from 'react'

interface InternalLinkProps {
    href: string
    text: string
}

const internalLinks: InternalLinkProps[] = [
    { href: '/articles', text: 'Articles' },
    { href: 'https://github.com/SarriaXD?tab=repositories', text: 'Projects' },
]

const InternalLink = ({ href, text }: InternalLinkProps) => {
    return (
        <li>
            <Link href={href}>
                <Button
                    variant="text"
                    size="lg"
                    color="white"
                    className="normal-case"
                >
                    {text}
                </Button>
            </Link>
        </li>
    )
}

interface ExternalLinkProps {
    href: string
    className: string
    tip: string
}

const externalLinks: ExternalLinkProps[] = [
    {
        href: 'mailto:sarria.qi.wang@gmail.com',
        className: 'fa-solid fa-envelope',
        tip: 'Contact me via email',
    },
    {
        href: 'https://www.linkedin.com/in/qi-wang-793a562a7',
        className: 'fa-brands fa-linkedin',
        tip: 'Connect with me on LinkedIn',
    },
    {
        href: 'https://github.com/SarriaXD',
        className: 'fa-brands fa-github',
        tip: 'Check out my GitHub',
    },
]

const ExternalLink = ({ href, className, tip }: ExternalLinkProps) => {
    return (
        <li>
            <Link href={href}>
                <Tooltip content={tip}>
                    <IconButton>
                        <i className={`${className} text-2xl`} />
                    </IconButton>
                </Tooltip>
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
                <nav
                    className="fixed
              left-0 right-0 top-0
              z-50
              flex items-center justify-between
              gap-4 bg-[#050C0F]
              bg-opacity-60 py-2 pl-4 pr-8
              backdrop-blur
              md:px-12
              "
                >
                    <IconButton
                        size="lg"
                        className="md:hidden"
                        onClick={() => setOpen(true)}
                    >
                        <i className="fa-solid fa-bars fa-lg" />
                    </IconButton>
                    <Link href="/public">
                        <i className="fa-solid fa-dog text-2xl text-gray-200" />
                    </Link>
                    <ul className="hidden gap-6 md:flex md:items-center">
                        {internalLinks.map((link) => (
                            <InternalLink key={link.text} {...link} />
                        ))}
                        {externalLinks.map((link) => (
                            <ExternalLink key={link.href} {...link} />
                        ))}
                    </ul>
                </nav>
            </header>
            <SideBar open={open} onClose={onClose} />
        </>
    )
}
