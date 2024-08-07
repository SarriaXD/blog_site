'use client'

import { Button, IconButton, Tooltip } from './Material.tsx'
import Link from 'next/link'
import { SideBar } from './SideBar.tsx'
import { useState } from 'react'
import { BurgerMenu, Dog, Email, Github, Linkedin } from '../../public/icons'

const internalLinks = [
    { href: '/articles', text: 'Articles' },
    { href: 'https://github.com/SarriaXD?tab=repositories', text: 'Projects' },
    { href: '/tools', text: 'Tools' },
]

const InternalLink = ({ href, text }: { href: string; text: string }) => {
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
              bg-opacity-60 px-4 py-2
              backdrop-blur
              md:px-12
              "
                >
                    <IconButton
                        size="lg"
                        className="md:hidden"
                        aria-label="Open sidebar"
                        onClick={() => setOpen(true)}
                    >
                        <BurgerMenu className="size-6 text-white" />
                    </IconButton>
                    <Link href="/">
                        <IconButton
                            size="lg"
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
                                    <IconButton aria-label="Email Me">
                                        <Email className="size-6 text-white" />
                                    </IconButton>
                                </Tooltip>
                            </Link>
                        </li>
                        <li>
                            <Link href="https://www.linkedin.com/in/qi-wang-793a562a7">
                                <Tooltip content="Connect with me on LinkedIn">
                                    <IconButton aria-label="View My Linkedin">
                                        <Linkedin className="size-6 text-white" />
                                    </IconButton>
                                </Tooltip>
                            </Link>
                        </li>
                        <li>
                            <Link href="https://github.com/SarriaXD">
                                <Tooltip content="Check out my GitHub">
                                    <IconButton aria-label="View My Github">
                                        <Github className="size-6 text-white" />
                                    </IconButton>
                                </Tooltip>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <SideBar open={open} onClose={onClose} />
        </>
    )
}
